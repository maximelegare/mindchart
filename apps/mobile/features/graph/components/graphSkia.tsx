import React, { useMemo, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  Text,
  RoundedRect,
  useFont,
} from "@shopify/react-native-skia";
import * as d3 from "d3-hierarchy";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { hsl, hslColor } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  DEFAULT_CATEGORY_COLOR,
  useCategoryColorMap,
} from "@/features/categories/hooks/useCategoryColor";
import { useCategoryLabelsMap } from "@/features/categories/hooks/useCategoryLabels";
import { Icon } from "@/components/ui/icons/icon";
import { GraphMode, NodeDatum } from "@/features/graph/types/types";
import { resolveNodeCategoryKey } from "@/features/graph/utils/resolveNodeCategoryKey";
import { GraphLoadingPlaceholder } from "./graphLoadingPlaceholder";
import { GraphModeTabs } from "./graphModeTabs";
import { folderLayerColor, GRAPH_CANVAS_SIZE } from "../constants";
import { onGraphBreadcrumbNavigate } from "@/features/navigation/syncLinkedBreadcrumbs";
import { isEmptyFolderNode } from "@/features/graph/utils/buildGraphByFolder";
import { isNoteLeafId } from "@/features/graph/utils/mapNoteToLeaf";
import { isSyntheticRoot } from "@/features/graph/utils/filterGraphHierarchy";
import { useGraphStore } from "../context/graphContext";

/** Folder-mode note leaf fill. */
const NOTE_LEAF_FILL = "#E3F0FC";

const parseHslChannels = (hslColor: string) => {
  const inside = hslColor.replace(/^hsla?\(|\)$/g, "").trim();
  const parts = inside.includes(",")
    ? inside.split(",").map((part) => part.trim())
    : inside.split(/\s+/);
  if (parts.length < 3) return null;
  return {
    h: parts[0],
    s: parseFloat(parts[1].replace("%", "")),
    l: parseFloat(parts[2].replace("%", "")),
  };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
};

const parseColorToRgb = (color: string) => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    if (full.length !== 6) return null;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const channels = parseHslChannels(color);
  if (!channels) return null;
  return hslToRgb(parseFloat(channels.h), channels.s, channels.l);
};

/** Blend `from` toward `toward` by `amount` (0 = from, 1 = toward). */
const mixColors = (from: string, toward: string, amount: number) => {
  const a = parseColorToRgb(from);
  const b = parseColorToRgb(toward);
  if (!a || !b) return from;
  const t = Math.min(1, Math.max(0, amount));
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
};

/** Canvas / root fill — matches card background. */
const neutralMixTarget = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => hsl("card", "theme", colorScheme === "dark" ? "dark" : "light");

/** How much pack fills blend into the dark canvas (reads as transparency). */
const DARK_PACK_SOFTEN = 0.45;

/**
 * Category packs: first layer (the category itself) is a light shade;
 * deeper nested packs step toward a darker shade of the same hue.
 */
const shadeCategoryLayer = (
  base: string,
  layerIndex: number,
  layerCount: number
): string => {
  const channels = parseHslChannels(base);
  if (!channels) return base;

  const t =
    layerCount <= 1
      ? 0
      : Math.min(Math.max(layerIndex, 0), layerCount - 1) / (layerCount - 1);

  const lightL = Math.min(94, channels.l + (100 - channels.l) * 0.55);
  const darkL = Math.max(36, channels.l * 0.52);
  const l = lightL + (darkL - lightL) * t;
  const s = Math.min(100, channels.s + t * 14);

  return `hsl(${channels.h}, ${s}%, ${l}%)`;
};

const SIZE = GRAPH_CANVAS_SIZE;
const PACK_PADDING = 8;
const LABEL_GAP = -10;
const LABEL_FONT_SIZE = 10;
const LABEL_PAD_X = 5;
const LABEL_PAD_Y = 2;
const LABEL_BG_RADIUS = 3;
const MAX_LABEL_LENGTH = 20;

type NodeInfo = {
  dbId: string;
  internalId: string;
  x: number;
  y: number;
  r: number;
  parentId?: string;
  depth: number;
  hasChildren: boolean;
  rawData: NodeDatum;
};

type Layout = {
  rootNode: NodeInfo;
  allNodes: NodeInfo[];
  nodeMap: Map<string, NodeInfo>;
};

/** O(1) lookup for infos/deep-link ids. First write wins (matches previous find order). */
const buildFocusIndex = (allNodes: NodeInfo[]) => {
  const index = new Map<string, NodeInfo>();
  const add = (key: string | undefined | null, node: NodeInfo) => {
    if (!key || index.has(key)) return;
    index.set(key, node);
  };

  for (const node of allNodes) {
    add(node.dbId, node);
  }
  for (const node of allNodes) {
    const data = node.rawData;
    add(data.id, node);
    if (data.noteId) {
      add(data.noteId, node);
      add(`note-${data.noteId}`, node);
    }
    if (data.thoughtId) add(data.thoughtId, node);
    if (data.folderId) {
      add(data.folderId, node);
      add(`folder-${data.folderId}`, node);
    }
    for (const thoughtId of data.relatedThoughtIds ?? []) {
      add(thoughtId, node);
    }
  }

  return index;
};

const resolveFocusTarget = (
  focusId: string | undefined,
  rootNode: NodeInfo,
  nodeMap: Map<string, NodeInfo>,
  focusIndex: Map<string, NodeInfo>
): NodeInfo => {
  let target = rootNode;
  if (focusId) {
    const found =
      focusIndex.get(focusId) ??
      focusIndex.get(`note-${focusId}`) ??
      focusIndex.get(`folder-${focusId}`);
    if (found) target = found;
  }

  if (
    !target.hasChildren &&
    !isEmptyFolderNode(target.rawData) &&
    target.parentId
  ) {
    const parent = nodeMap.get(target.parentId);
    if (parent) target = parent;
  }

  return target;
};

const isCategoryPackNode = (node: NodeInfo) =>
  node.dbId.startsWith("category-");

const findCategoryPackAncestor = (
  node: NodeInfo,
  nodeMap: Map<string, NodeInfo>,
  rootNode: NodeInfo
): NodeInfo | null => {
  let current: NodeInfo | undefined = node;
  while (current) {
    if (isCategoryPackNode(current)) return current;
    current = current.parentId ? nodeMap.get(current.parentId) : undefined;
  }
  // Filtered view: the pack root is the category itself.
  if (isCategoryPackNode(rootNode)) return rootNode;
  return null;
};

/**
 * Pack-layer counts for category shade ladders (and unused folder bookkeeping).
 * Category mode: keyed by category internalId.
 * Folder mode: keyed by root internalId.
 */
const computePackLayerCounts = (
  allNodes: NodeInfo[],
  nodeMap: Map<string, NodeInfo>,
  rootNode: NodeInfo,
  graphMode: GraphMode,
  data: NodeDatum
) => {
  const counts = new Map<string, number>();
  const skipSyntheticRoot = isSyntheticRoot(data);

  for (const node of allNodes) {
    if (!node.hasChildren) continue;

    if (graphMode === "folder") {
      // Graph root shell stays neutral — ladder starts at first real folders.
      if (skipSyntheticRoot && node.depth === 0) continue;
      const layerIndex = skipSyntheticRoot ? node.depth - 1 : node.depth;
      const layers = layerIndex + 1;
      const prev = counts.get(rootNode.internalId) ?? 1;
      if (layers > prev) counts.set(rootNode.internalId, layers);
      continue;
    }

    const category = findCategoryPackAncestor(node, nodeMap, rootNode);
    if (!category) continue;
    const layers = node.depth - category.depth + 1;
    const prev = counts.get(category.internalId) ?? 1;
    if (layers > prev) counts.set(category.internalId, layers);
  }

  return counts;
};

// Module-level cache: d3 hierarchy + circle-pack layout.
// `fetchGraphData` does JSON.parse on every call, producing a brand-new object
// tree whose references differ across navigations even when the content is
// identical. We therefore key the cache on a cheap structural signature of the
// data (preorder of node ids + child counts) with a reference fast-path so a
// fresh component instance can reuse the previously computed layout instead of
// recomputing from scratch.
const computeSignature = (root: NodeDatum): string => {
  const parts: string[] = [];
  const walk = (n: NodeDatum) => {
    // Include folder/category attach so moves bust layout cache even when the
    // preorder of ids + child counts happens to collide.
    parts.push(
      n.id,
      String(n.children?.length ?? 0),
      n.folderId ?? "",
      n.categoryId ?? "",
      n.folderPath ?? ""
    );
    n.children?.forEach(walk);
  };
  walk(root);
  return parts.join("|");
};

let cachedLayoutEntry: {
  dataRef: NodeDatum;
  signature: string;
  padding: number;
  layout: Layout;
} | null = null;

const layoutCache = new Map<string, Layout>();

const layoutCacheKey = (signature: string, padding: number) =>
  `${signature}:${padding}`;

const getOrComputeLayout = (
  data: NodeDatum,
  padding: number
): { layout: Layout; hitReason: "ref" | "sig" | "miss" } => {
  if (
    cachedLayoutEntry &&
    cachedLayoutEntry.dataRef === data &&
    cachedLayoutEntry.padding === padding
  ) {
    return { layout: cachedLayoutEntry.layout, hitReason: "ref" };
  }
  const signature = computeSignature(data);
  const key = layoutCacheKey(signature, padding);
  const cachedLayout = layoutCache.get(key);
  if (cachedLayout) {
    cachedLayoutEntry = {
      dataRef: data,
      signature,
      padding,
      layout: cachedLayout,
    };
    return { layout: cachedLayout, hitReason: "sig" };
  }
  const layout = computeLayout(data, padding);
  layoutCache.set(key, layout);
  cachedLayoutEntry = { dataRef: data, signature, padding, layout };
  return { layout, hitReason: "miss" };
};

export const warmupGraphLayouts = (cache: {
  category: NodeDatum;
  folder: NodeDatum;
}) => {
  setTimeout(() => {
    getOrComputeLayout(cache.category, PACK_PADDING);
    setTimeout(() => {
      getOrComputeLayout(cache.folder, PACK_PADDING);
    }, 0);
  }, 0);
};

export const getCachedGraphLayout = (
  data: NodeDatum,
  padding = PACK_PADDING
): Layout | null => {
  const signature = computeSignature(data);
  return layoutCache.get(layoutCacheKey(signature, padding)) ?? null;
};

const computeLayout = (data: NodeDatum, padding: number): Layout => {
  const hierarchyRoot = d3
    .hierarchy<NodeDatum>(data)
    .sum((d) => d.value || 1)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const packed = d3.pack<NodeDatum>().size([SIZE, SIZE]).padding(padding)(
    hierarchyRoot
  );

  const nodes: NodeInfo[] = [];
  const map = new Map<string, NodeInfo>();
  let counter = 0;

  const walk = (
    node: d3.HierarchyCircularNode<NodeDatum>,
    parentId?: string
  ) => {
    const internalId = `node-${counter++}`;
    const info: NodeInfo = {
      dbId: String(node.data.id),
      internalId,
      x: node.x,
      y: node.y,
      r: node.r,
      parentId,
      depth: node.depth,
      hasChildren: !!node.children && node.children.length > 0,
      rawData: node.data,
    };
    nodes.push(info);
    map.set(internalId, info);
    if (node.children) node.children.forEach((c) => walk(c, internalId));
  };

  walk(packed);

  return { rootNode: nodes[0], allNodes: nodes, nodeMap: map };
};

const countDirectChildren = (parent: NodeInfo, allNodes: NodeInfo[]) =>
  allNodes.filter((n) => n.parentId === parent.internalId).length;

/** Empty folder pack in layout space (flag + leaf folder without content). */
const isEmptyPackNode = (node: NodeInfo) => {
  if (isEmptyFolderNode(node.rawData)) return true;
  if (node.hasChildren) return false;
  if (
    isNoteLeafId(node.dbId) ||
    node.rawData.thoughtId ||
    node.rawData.noteId
  ) {
    return false;
  }
  const folderId = node.rawData.folderId;
  return !!folderId && folderId !== "unfiled";
};

/** Packs you can zoom into — includes empty folders (no content children). */
const isNavigablePack = (node: NodeInfo) =>
  node.hasChildren || isEmptyPackNode(node);

const isFirstLevelGroup = (node: NodeInfo) =>
  node.depth === 1 && isNavigablePack(node);

/** Muted empty-folder fill — hex so Skia paints reliably vs card canvas (~#2E2E2E). */
const emptyFolderFill = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => (colorScheme === "dark" ? "#6B6B6B" : "#C8C8C8");

const emptyFolderStroke = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => (colorScheme === "dark" ? "#9A9A9A" : "#A3A3A3");

/** Centered “Empty” label — light grey on the node. */
const emptyLabelColor = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => (colorScheme === "dark" ? "#D0D0D0" : "#8A8A8A");

const EMPTY_LABEL_FONT_SIZE = 12;

const isFolderModeNoteLeaf = (node: NodeInfo) =>
  !node.hasChildren && isNoteLeafId(node.dbId);

const formatLabel = (name: string) => {
  if (!name) return "";
  const formatted = name.charAt(0).toUpperCase() + name.slice(1);
  if (formatted.length <= MAX_LABEL_LENGTH) return formatted;
  return `${formatted.slice(0, MAX_LABEL_LENGTH - 1)}…`;
};

const resolveNodeLabel = (
  node: NodeInfo,
  categoryLabels: Map<string, string>
): string => {
  const rawName = node.rawData.name;
  if (!isCategoryPackNode(node) || !rawName) return rawName || "";
  return categoryLabels.get(rawName) ?? rawName;
};

interface Props {
  data: NodeDatum;
  graphMode?: GraphMode;
  focusedThoughtId?: string;
  trigger?: string | number;
  onNodeSelected?: (node: NodeDatum, parent?: NodeDatum) => void;
}

export default function CirclePackSkia(props: Props) {
  const layoutRef = useRef<Layout | null>(
    getCachedGraphLayout(props.data) ?? null
  );
  const [layout, setLayout] = useState<Layout | null>(() => layoutRef.current);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    const cached = getCachedGraphLayout(props.data);
    if (cached) {
      layoutRef.current = cached;
      setLayout(cached);
      setIsComputing(false);
      return;
    }

    let cancelled = false;
    setIsComputing(true);

    const id = setTimeout(() => {
      if (cancelled) return;
      const { layout: nextLayout } = getOrComputeLayout(
        props.data,
        PACK_PADDING
      );
      layoutRef.current = nextLayout;
      setLayout(nextLayout);
      setIsComputing(false);
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [props.data]);

  const activeLayout = layout ?? layoutRef.current;
  if (!activeLayout) {
    return isComputing ? <GraphLoadingPlaceholder /> : null;
  }

  return (
    <CirclePackSkiaRenderer
      key={computeSignature(props.data)}
      {...props}
      layout={activeLayout}
    />
  );
}

function CirclePackSkiaRenderer({
  data,
  layout,
  graphMode = "category",
  focusedThoughtId,
  trigger,
  onNodeSelected,
}: Props & { layout: Layout }) {
  const { colorScheme } = useColorScheme();
  const categoryColorMap = useCategoryColorMap();
  const categoryLabels = useCategoryLabelsMap();
  const isTransitioningInternal = useRef(false);
  const { rootNode, allNodes, nodeMap } = layout;
  const focusIndex = useMemo(() => buildFocusIndex(allNodes), [allNodes]);

  // ---------- 2. Shared Values ----------
  const viewX = useSharedValue(rootNode.x);
  const viewY = useSharedValue(rootNode.y);
  const viewR = useSharedValue(rootNode.r);
  const activeInternalId = useSharedValue(rootNode.internalId);
  const previousInternalId = useSharedValue(rootNode.internalId);
  const [activeViewNode, setActiveViewNode] = useState(rootNode);

  useEffect(() => {
    setActiveViewNode(rootNode);
  }, [rootNode.internalId]);

  // ---------- 3. Camera Helper ----------
  const navigateToNode = (
    node: NodeInfo,
    isToggleBack = false,
    /** When true, mirror this navigation into notes (linked breadcrumbs). */
    syncNotesFolder = false
  ) => {
    if (!isToggleBack) {
      previousInternalId.value = activeInternalId.value;
    }

    activeInternalId.value = node.internalId;
    setActiveViewNode(node);
    const config = { duration: 600, easing: Easing.out(Easing.exp) };

    viewX.value = withTiming(node.x, config);
    viewY.value = withTiming(node.y, config);
    viewR.value = withTiming(node.r, config);

    const applySelection = () => {
      if (onNodeSelected) {
        const parent = node.parentId ? nodeMap.get(node.parentId) : undefined;
        onNodeSelected(node.rawData, parent?.rawData);
      }

      if (syncNotesFolder) {
        const targetId = isSyntheticRoot(node.rawData)
          ? "root"
          : node.rawData.id;
        onGraphBreadcrumbNavigate(targetId);
      }
    };

    // Going home unmounts the infos tree — yield so the camera starts first.
    if (node.internalId === rootNode.internalId) {
      setTimeout(applySelection, 0);
    } else {
      applySelection();
    }
  };
  const navigateToNodeRef = useRef(navigateToNode);
  navigateToNodeRef.current = navigateToNode;

  const focusNodeById = (nodeId: string) => {
    isTransitioningInternal.current = true;
    const target = resolveFocusTarget(nodeId, rootNode, nodeMap, focusIndex);
    navigateToNodeRef.current(target, false);
  };

  useEffect(() => {
    useGraphStore.getState().setFocusGraphNode(focusNodeById);
    return () => {
      useGraphStore.getState().setFocusGraphNode(null);
    };
  }, [focusIndex, nodeMap, rootNode]);

  // ---------- 4. External Focus Effect ----------
  useEffect(() => {
    // If we are already moving because the user tapped a circle,
    // don't restart the animation from the effect.
    if (isTransitioningInternal.current) {
      isTransitioningInternal.current = false;
      return;
    }

    const target = resolveFocusTarget(
      focusedThoughtId ? String(focusedThoughtId) : undefined,
      rootNode,
      nodeMap,
      focusIndex
    );

    navigateToNodeRef.current(target, false);
  }, [focusedThoughtId, trigger, focusIndex, nodeMap, rootNode]);

  // ---------- 5. Interaction Handlers ----------
  const tap = Gesture.Tap().onEnd((e) => {
    "use worklet";
    const k = SIZE / (viewR.value * 2);
    const gx = (e.x - SIZE / 2) / k + viewX.value;
    const gy = (e.y - SIZE / 2) / k + viewY.value;

    for (let i = allNodes.length - 1; i >= 0; i--) {
      const n = allNodes[i];
      const dx = gx - n.x;
      const dy = gy - n.y;

      if (Math.sqrt(dx * dx + dy * dy) <= n.r) {
        isTransitioningInternal.current = true; // Block the next useEffect
        let targetToProcess = n;

        // Use the flag directly — worklets can't call imported JS helpers.
        if (!n.hasChildren && !n.rawData.isEmptyFolder && n.parentId) {
          const parent = nodeMap.get(n.parentId);
          if (parent) targetToProcess = parent;
        }

        const isSameTarget =
          activeInternalId.value === targetToProcess.internalId;
        const prev = nodeMap.get(previousInternalId.value);
        const isParentChild =
          !!prev &&
          (prev.internalId === targetToProcess.parentId ||
            targetToProcess.internalId === prev.parentId);
        const canToggleBack =
          !!prev && (isParentChild || prev.internalId === rootNode.internalId);

        if (
          isSameTarget &&
          targetToProcess.rawData.name?.toLowerCase() !== "root" &&
          canToggleBack
        ) {
          runOnJS(navigateToNode)(prev, true, true);
        } else if (!isSameTarget) {
          runOnJS(navigateToNode)(targetToProcess, false, true);
        } else {
          runOnJS(navigateToNode)(rootNode, false, true);
        }
        break;
      }
    }
  });

  const handleZoomBack = () => {
    isTransitioningInternal.current = true;
    const current = nodeMap.get(activeInternalId.value);
    if (current?.parentId) {
      const parent = nodeMap.get(current.parentId);
      if (parent) navigateToNode(parent, false, true);
    } else if (current && current.internalId !== rootNode.internalId) {
      navigateToNode(rootNode, false, true);
    }
  };

  const handleZoomOut = () => {
    isTransitioningInternal.current = true;
    const current = nodeMap.get(activeInternalId.value);
    if (current?.rawData.name === "Root") return;
    navigateToNode(rootNode, false, true);
  };

  const packLayerCounts = useMemo(
    () => computePackLayerCounts(allNodes, nodeMap, rootNode, graphMode, data),
    [allNodes, data, graphMode, nodeMap, rootNode]
  );

  // ---------- 6. Dynamic Color Logic ----------
  const softenPackForTheme = (packColor: string) => {
    if (colorScheme !== "dark") return packColor;
    return mixColors(packColor, neutralMixTarget("dark"), DARK_PACK_SOFTEN);
  };

  const getNodeColor = (node: NodeInfo) => {
    if (isEmptyPackNode(node)) {
      return emptyFolderFill(colorScheme);
    }

    if (graphMode === "folder" && isFolderModeNoteLeaf(node)) {
      return colorScheme === "dark"
        ? softenPackForTheme(NOTE_LEAF_FILL)
        : NOTE_LEAF_FILL;
    }

    if (!node.hasChildren) {
      return colorScheme === "dark" ? softenPackForTheme("#FFFFFF") : "white";
    }

    // Synthetic graph root stays neutral — not the same tint as first real nodes.
    if (node.depth === 0 && isSyntheticRoot(data)) {
      return neutralMixTarget(colorScheme);
    }

    if (graphMode === "folder") {
      const layerIndex = isSyntheticRoot(data) ? node.depth - 1 : node.depth;
      return softenPackForTheme(folderLayerColor(Math.max(0, layerIndex)));
    }

    const category = findCategoryPackAncestor(node, nodeMap, rootNode);
    const cat =
      resolveNodeCategoryKey(node.rawData) ??
      (category ? resolveNodeCategoryKey(category.rawData) : undefined);

    if (!cat) return neutralMixTarget(colorScheme);

    const layerIndex = category ? Math.max(0, node.depth - category.depth) : 0;
    const layerCount = category
      ? (packLayerCounts.get(category.internalId) ?? 1)
      : 1;

    const categoryColor = categoryColorMap.get(cat) ?? DEFAULT_CATEGORY_COLOR;
    return softenPackForTheme(
      shadeCategoryLayer(hslColor(categoryColor), layerIndex, layerCount)
    );
  };

  const labelsByInternalId = useMemo(() => {
    const labels = new Map<string, { text: string; empty: boolean }>();
    const atRoot = activeViewNode.internalId === rootNode.internalId;

    // Current folder is an empty pack — centered “Empty” on the node.
    if (isEmptyPackNode(activeViewNode)) {
      labels.set(activeViewNode.internalId, { text: "Empty", empty: true });
      return labels;
    }

    if (atRoot) {
      for (const node of allNodes) {
        if (!isFirstLevelGroup(node)) continue;
        if (isEmptyPackNode(node)) {
          labels.set(node.internalId, { text: "Empty", empty: true });
          continue;
        }
        if (countDirectChildren(node, allNodes) >= 2) {
          labels.set(node.internalId, {
            text: formatLabel(resolveNodeLabel(node, categoryLabels)),
            empty: false,
          });
        }
      }
      return labels;
    }

    // Parent pack selected — label direct children; empty ones say Empty.
    for (const node of allNodes) {
      if (node.parentId !== activeViewNode.internalId) continue;
      if (!isNavigablePack(node)) continue;
      if (isEmptyPackNode(node)) {
        labels.set(node.internalId, { text: "Empty", empty: true });
      } else {
        labels.set(node.internalId, {
          text: formatLabel(resolveNodeLabel(node, categoryLabels)),
          empty: false,
        });
      }
    }

    return labels;
  }, [activeViewNode, allNodes, categoryLabels, rootNode]);

  const labelColor = hsl("foreground", colorScheme);
  const labelBgColor = hsl("background", colorScheme);
  const emptyLabelFill = emptyLabelColor(colorScheme);

  const labeledNodes = useMemo(() => {
    const items: { node: NodeInfo; text: string; empty: boolean }[] = [];
    labelsByInternalId.forEach(({ text, empty }, internalId) => {
      const node = nodeMap.get(internalId);
      if (node) items.push({ node, text, empty });
    });
    return items;
  }, [labelsByInternalId, nodeMap]);

  const isAtRoot = activeViewNode.internalId === rootNode.internalId;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.wrapper,
          {
            backgroundColor: neutralMixTarget(colorScheme),
          },
        ]}
      >
        <View style={styles.header}>
          <GraphModeTabs />
        </View>
        <View style={styles.canvasContainer}>
          <GestureDetector gesture={tap}>
            <Canvas style={styles.canvas}>
              {allNodes.map((node) => {
                const isNoteLeaf =
                  graphMode === "folder" && isFolderModeNoteLeaf(node);
                const isEmpty = isEmptyPackNode(node);
                return (
                  <SkCircle
                    key={node.internalId}
                    node={node}
                    viewX={viewX}
                    viewY={viewY}
                    viewR={viewR}
                    color={getNodeColor(node)}
                    showBorder={isNoteLeaf || isEmpty}
                    borderColor={
                      isEmpty ? emptyFolderStroke(colorScheme) : "#FFFFFF"
                    }
                  />
                );
              })}
              {labeledNodes.map(({ node, text, empty }) => (
                <SkLabel
                  key={`label-${node.internalId}`}
                  node={node}
                  text={text}
                  color={empty ? emptyLabelFill : labelColor}
                  backgroundColor={labelBgColor}
                  thin={empty}
                  hideBackground={empty}
                  centered={empty}
                  viewX={viewX}
                  viewY={viewY}
                  viewR={viewR}
                />
              ))}
            </Canvas>
          </GestureDetector>

          <View
            className="absolute gap-2 p-2 m-2"
            style={{ bottom: 0, right: 0 }}
          >
            <Pressable
              onPress={handleZoomBack}
              disabled={isAtRoot}
              style={{
                ...styles.zoomBtn,
                backgroundColor: hsl("background", colorScheme),
                opacity: isAtRoot ? 0.4 : 1,
              }}
            >
              <Icon
                name="zoom-out"
                color="text"
                opacity={isAtRoot ? 50 : 100}
              />
            </Pressable>
            <Pressable
              onPress={handleZoomOut}
              disabled={isAtRoot}
              style={{
                ...styles.zoomBtn,
                backgroundColor: hsl("background", colorScheme),
                opacity: isAtRoot ? 0.4 : 1,
              }}
            >
              <Icon name="house" color="text" opacity={isAtRoot ? 50 : 100} />
            </Pressable>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

type SkLabelProps = {
  node: NodeInfo;
  text: string;
  color: string;
  backgroundColor: string;
  /** Regular weight instead of bold (empty-state hints). */
  thin?: boolean;
  hideBackground?: boolean;
  /** Place label at the node center (empty folders). */
  centered?: boolean;
  viewX: { value: number };
  viewY: { value: number };
  viewR: { value: number };
};

const SkLabel = ({
  node,
  text,
  color,
  backgroundColor,
  thin = false,
  hideBackground = false,
  centered = false,
  viewX,
  viewY,
  viewR,
}: SkLabelProps) => {
  const fontSize = centered ? EMPTY_LABEL_FONT_SIZE : LABEL_FONT_SIZE;
  const font = useFont(
    thin
      ? require("@/assets/fonts/Quicksand-Regular.ttf")
      : require("@/assets/fonts/Quicksand-Bold.ttf"),
    fontSize
  );

  const textWidth = useMemo(() => {
    if (!font) return 0;
    return font.measureText(text).width;
  }, [font, text]);

  const bgWidth = textWidth + LABEL_PAD_X * 2;
  const bgHeight = fontSize + LABEL_PAD_Y * 2;

  const textY = useMemo(() => {
    if (!font) return 0;
    const metrics = font.getMetrics();
    if (centered) {
      // Baseline so the glyph box is vertically centered on the node.
      return -(metrics.ascent + metrics.descent) / 2;
    }
    return -bgHeight / 2 - (metrics.ascent + metrics.descent) / 2;
  }, [font, bgHeight, centered]);

  const labelTransform = useDerivedValue(() => {
    const k = SIZE / (viewR.value * 2);
    const cx = SIZE / 2 + (node.x - viewX.value) * k;
    if (centered) {
      const cy = SIZE / 2 + (node.y - viewY.value) * k;
      return [{ translateX: cx }, { translateY: cy }];
    }
    const anchorY =
      SIZE / 2 + (node.y - viewY.value) * k - node.r * k - LABEL_GAP;
    return [{ translateX: cx }, { translateY: anchorY }];
  });

  if (!font) return null;

  return (
    <Group transform={labelTransform}>
      {!hideBackground ? (
        <RoundedRect
          x={-bgWidth / 2}
          y={-bgHeight}
          width={bgWidth}
          height={bgHeight}
          r={LABEL_BG_RADIUS}
          color={backgroundColor}
          opacity={0.7}
        />
      ) : null}
      <Text
        x={-textWidth / 2}
        y={textY}
        text={text}
        font={font}
        color={color}
      />
    </Group>
  );
};

type SkCircleProps = {
  node: NodeInfo;
  viewX: { value: number };
  viewY: { value: number };
  viewR: { value: number };
  color: string;
  showBorder?: boolean;
  borderColor?: string;
};

const SkCircle = ({
  node,
  viewX,
  viewY,
  viewR,
  color,
  showBorder = false,
  borderColor = "rgba(0,0,0,0.1)",
}: SkCircleProps) => {
  const transform = useDerivedValue(() => {
    const k = SIZE / (viewR.value * 2);
    return [
      { translateX: SIZE / 2 + (node.x - viewX.value) * k },
      { translateY: SIZE / 2 + (node.y - viewY.value) * k },
      { scale: k },
    ];
  });

  // Keep the root ring ~1 screen px as the camera zooms.
  const borderStrokeWidth = useDerivedValue(() => {
    const k = SIZE / (viewR.value * 2);
    return k > 0 ? 1 / k : 1;
  });

  return (
    <Group transform={transform}>
      <Circle cx={0} cy={0} r={node.r} color={color} />
      {showBorder ? (
        <Circle
          cx={0}
          cy={0}
          r={node.r}
          style="stroke"
          strokeWidth={borderStrokeWidth}
          color={borderColor}
        />
      ) : null}
    </Group>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    borderRadius: 18,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
  },
  header: {
    width: "100%",
  },
  canvasContainer: {
    width: SIZE,
    height: SIZE,
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
  zoomBtn: {
    position: "relative",
    width: 38,
    height: 38,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
