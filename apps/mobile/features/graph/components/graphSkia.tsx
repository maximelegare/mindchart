import React, { useMemo, useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  Line,
  Skia,
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
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { Icon } from "@/components/ui/icons/icon";
import { GraphMode, NodeDatum } from "@/features/graph/types/types";
import { resolveNodeCategoryKey } from "@/features/graph/utils/resolveNodeCategoryKey";
import { isSyntheticRoot } from "@/features/graph/utils/filterGraphHierarchy";
import { GraphLoadingPlaceholder } from "./graphLoadingPlaceholder";
import { GraphFolderChips } from "./graphFolderChips";
import { GRAPH_CANVAS_SIZE } from "../constants";

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

/**
 * Opaque blend of `base` toward `mixWith` — `strength` 1 = full base color.
 * Values above 1 extrapolate past the base (richer / deeper).
 */
const mixHslToward = (base: string, mixWith: string, strength: number) => {
  const from = parseHslChannels(base);
  const to = parseHslChannels(mixWith);
  if (!from || !to) return base;
  const t = Math.max(0, strength);
  const s = Math.min(100, Math.max(0, to.s + (from.s - to.s) * t));
  const l = Math.min(100, Math.max(0, to.l + (from.l - to.l) * t));
  return `hsl(${from.h}, ${s}%, ${l}%)`;
};

/** First pack layer tint; deepest pack layer tint; leaves stay white. */
const PACK_STRENGTH_FIRST = 0.3;
const PACK_STRENGTH_LAST = 1.5;

/**
 * Evenly divide tint from first→last across `layerCount` pack layers.
 * 1 layer → last (150%); 2 → 30%/150%; 3 → 30%/90%/150%; …
 */
const packLayerStrength = (layerIndex: number, layerCount: number) => {
  if (layerCount <= 1) return PACK_STRENGTH_LAST;
  const t =
    Math.min(Math.max(layerIndex, 0), layerCount - 1) / (layerCount - 1);
  return PACK_STRENGTH_FIRST + (PACK_STRENGTH_LAST - PACK_STRENGTH_FIRST) * t;
};

/** Neutral mix target (no theme-green card tint in S/L). */
const neutralMixTarget = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => (colorScheme === "dark" ? "hsl(0, 0%, 12%)" : "hsl(0, 0%, 100%)");

const tintWithStrength = (
  base: string,
  strength: number,
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => mixHslToward(base, neutralMixTarget(colorScheme), strength);

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
 * Pack-layer counts for the shared 30%→150% ladder.
 * Category mode: keyed by category internalId.
 * Folder mode: keyed by root internalId (synthetic graph root is excluded from tint).
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
    parts.push(n.id, String(n.children?.length ?? 0));
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

const isFirstLevelGroup = (node: NodeInfo) =>
  node.depth === 1 && node.hasChildren;

const isSecondLevelGroup = (node: NodeInfo, parentInternalId: string) =>
  node.depth === 2 && node.hasChildren && node.parentId === parentInternalId;

const formatLabel = (name: string) => {
  if (!name) return "";
  const formatted = name.charAt(0).toUpperCase() + name.slice(1);
  if (formatted.length <= MAX_LABEL_LENGTH) return formatted;
  return `${formatted.slice(0, MAX_LABEL_LENGTH - 1)}…`;
};

const buildHatchLines = (r: number, lineColor: string) => {
  const spacing = Math.max(3, r * 0.12);
  const strokeWidth = Math.max(0.5, r * 0.035);
  const span = r * 2.5;
  const lines: React.ReactNode[] = [];
  let key = 0;
  for (let d = -span; d <= span; d += spacing) {
    lines.push(
      <Line
        key={key++}
        p1={{ x: d - r, y: -r }}
        p2={{ x: d + r, y: r }}
        color={lineColor}
        strokeWidth={strokeWidth}
      />
    );
  }
  return lines;
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
  const isTransitioningInternal = useRef(false);
  const [hatchHighlightActive, setHatchHighlightActive] =
    useState(!!focusedThoughtId);
  const { rootNode, allNodes, nodeMap } = layout;

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
    dismissFocusHighlight = false
  ) => {
    if (dismissFocusHighlight && hatchHighlightActive) {
      setHatchHighlightActive(false);
    }

    if (!isToggleBack) {
      previousInternalId.value = activeInternalId.value;
    }

    activeInternalId.value = node.internalId;
    setActiveViewNode(node);
    const config = { duration: 600, easing: Easing.out(Easing.exp) };

    viewX.value = withTiming(node.x, config);
    viewY.value = withTiming(node.y, config);
    viewR.value = withTiming(node.r, config);

    if (onNodeSelected) {
      const parent = node.parentId ? nodeMap.get(node.parentId) : undefined;
      onNodeSelected(node.rawData, parent?.rawData);
    }
  };

  // ---------- 4. External Focus Effect ----------
  useEffect(() => {
    if (focusedThoughtId) {
      setHatchHighlightActive(true);
    }
  }, [focusedThoughtId, trigger]);

  useEffect(() => {
    // If we are already moving because the user tapped a circle,
    // don't restart the animation from the effect.
    if (isTransitioningInternal.current) {
      isTransitioningInternal.current = false;
      return;
    }

    let target = rootNode;
    if (focusedThoughtId) {
      const focusId = String(focusedThoughtId);
      const found =
        allNodes.find((n) => n.dbId === focusId) ??
        allNodes.find((n) => n.rawData.folderId === focusId) ??
        allNodes.find(
          (n) =>
            n.rawData.folderId != null &&
            (n.dbId === `folder-${n.rawData.folderId}` ||
              n.dbId.endsWith(`-${n.rawData.folderId}`)) &&
            focusId.endsWith(n.rawData.folderId)
        );
      if (found) target = found;
    }

    if (!target.hasChildren && target.parentId) {
      const parent = nodeMap.get(target.parentId);
      if (parent) target = parent;
    }

    navigateToNode(target, false);
  }, [focusedThoughtId, trigger, allNodes, rootNode]);

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

        if (!n.hasChildren && n.parentId) {
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
    // Zooming out via button should NOT block the effect,
    // so we don't set isTransitioningInternal to true here.
    const current = nodeMap.get(activeInternalId.value);
    if (current?.parentId) {
      const parent = nodeMap.get(current.parentId);
      if (parent) navigateToNode(parent, false, true);
    } else if (current && current.internalId !== rootNode.internalId) {
      navigateToNode(rootNode, false, true);
    }
  };

  const handleZoomOut = () => {
    const current = nodeMap.get(activeInternalId.value);
    if (current?.rawData.name === "Root") return;
    else navigateToNode(rootNode, false, true);
  };

  const packLayerCounts = useMemo(
    () => computePackLayerCounts(allNodes, nodeMap, rootNode, graphMode, data),
    [allNodes, data, graphMode, nodeMap, rootNode]
  );

  // ---------- 6. Dynamic Color Logic ----------
  const getNodeColor = (node: NodeInfo) => {
    if (!node.hasChildren) return "white";

    // Synthetic graph root stays neutral — not the same tint as first real nodes.
    if (node.depth === 0 && isSyntheticRoot(data)) {
      return neutralMixTarget(colorScheme);
    }

    if (graphMode === "folder") {
      const layerCount = packLayerCounts.get(rootNode.internalId) ?? 1;
      const layerIndex = isSyntheticRoot(data) ? node.depth - 1 : node.depth;
      return tintWithStrength(
        hsl("primary", colorScheme),
        packLayerStrength(Math.max(0, layerIndex), layerCount),
        colorScheme
      );
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

    return tintWithStrength(
      hsl(cat, colorScheme, undefined, "categories"),
      packLayerStrength(layerIndex, layerCount),
      colorScheme
    );
  };

  const focusedDbId = focusedThoughtId ? String(focusedThoughtId) : undefined;

  const labelsByInternalId = useMemo(() => {
    const labels = new Map<string, string>();
    const atRoot = activeViewNode.internalId === rootNode.internalId;

    if (atRoot) {
      for (const node of allNodes) {
        if (!isFirstLevelGroup(node)) continue;
        if (countDirectChildren(node, allNodes) >= 2) {
          labels.set(node.internalId, formatLabel(node.rawData.name));
        }
      }
      return labels;
    }

    if (isFirstLevelGroup(activeViewNode)) {
      for (const node of allNodes) {
        if (!isSecondLevelGroup(node, activeViewNode.internalId)) continue;
        labels.set(node.internalId, formatLabel(node.rawData.name));
      }
    }

    return labels;
  }, [activeViewNode, allNodes, rootNode]);

  const labelColor = hsl("foreground", colorScheme);
  const labelBgColor = hsl("background", colorScheme);

  const labeledNodes = useMemo(() => {
    const items: { node: NodeInfo; text: string }[] = [];
    labelsByInternalId.forEach((text, internalId) => {
      const node = nodeMap.get(internalId);
      if (node) items.push({ node, text });
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
            borderColor: hsl("border", colorScheme),
          },
        ]}
      >
        <GraphFolderChips />
        <View style={styles.canvasContainer}>
          <GestureDetector gesture={tap}>
            <Canvas style={styles.canvas}>
              {allNodes.map((node) => (
                <SkCircle
                  key={node.internalId}
                  node={node}
                  viewX={viewX}
                  viewY={viewY}
                  viewR={viewR}
                  color={getNodeColor(node)}
                  isFocusedThought={
                    hatchHighlightActive &&
                    !!focusedDbId &&
                    !node.hasChildren &&
                    node.dbId === focusedDbId
                  }
                  hatchLineColor={hsl("border", colorScheme, 10)}
                />
              ))}
              {labeledNodes.map(({ node, text }) => (
                <SkLabel
                  key={`label-${node.internalId}`}
                  node={node}
                  text={text}
                  color={labelColor}
                  backgroundColor={labelBgColor}
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
            <TouchableOpacity
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
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleZoomOut}
              disabled={isAtRoot}
              style={{
                ...styles.zoomBtn,
                backgroundColor: hsl("background", colorScheme),
                opacity: isAtRoot ? 0.4 : 1,
              }}
            >
              <Icon name="house" color="text" opacity={isAtRoot ? 50 : 100} />
            </TouchableOpacity>
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
  viewX: { value: number };
  viewY: { value: number };
  viewR: { value: number };
};

const SkLabel = ({
  node,
  text,
  color,
  backgroundColor,
  viewX,
  viewY,
  viewR,
}: SkLabelProps) => {
  const font = useFont(
    require("@/assets/fonts/Quicksand-Bold.ttf"),
    LABEL_FONT_SIZE
  );

  const textWidth = useMemo(() => {
    if (!font) return 0;
    return font.measureText(text).width;
  }, [font, text]);

  const bgWidth = textWidth + LABEL_PAD_X * 2;
  const bgHeight = LABEL_FONT_SIZE + LABEL_PAD_Y * 2;

  const textY = useMemo(() => {
    if (!font) return -bgHeight / 2;
    const metrics = font.getMetrics();
    return -bgHeight / 2 - (metrics.ascent + metrics.descent) / 2;
  }, [font, bgHeight]);

  const labelTransform = useDerivedValue(() => {
    const k = SIZE / (viewR.value * 2);
    const cx = SIZE / 2 + (node.x - viewX.value) * k;
    const anchorY =
      SIZE / 2 + (node.y - viewY.value) * k - node.r * k - LABEL_GAP;
    return [{ translateX: cx }, { translateY: anchorY }];
  });

  if (!font) return null;

  return (
    <Group transform={labelTransform}>
      <RoundedRect
        x={-bgWidth / 2}
        y={-bgHeight}
        width={bgWidth}
        height={bgHeight}
        r={LABEL_BG_RADIUS}
        color={backgroundColor}
        opacity={0.7}
      />
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
  isFocusedThought: boolean;
  hatchLineColor: string;
};

const SkCircle = ({
  node,
  viewX,
  viewY,
  viewR,
  color,
  isFocusedThought,
  hatchLineColor,
}: SkCircleProps) => {
  const transform = useDerivedValue(() => {
    const k = SIZE / (viewR.value * 2);
    return [
      { translateX: SIZE / 2 + (node.x - viewX.value) * k },
      { translateY: SIZE / 2 + (node.y - viewY.value) * k },
      { scale: k },
    ];
  });

  const clipPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, node.r);
    return p;
  }, [node.r]);

  const hatchLines = useMemo(
    () => buildHatchLines(node.r, hatchLineColor),
    [node.r, hatchLineColor]
  );

  return (
    <Group transform={transform}>
      {isFocusedThought ? (
        <Group clip={clipPath}>
          <Circle cx={0} cy={0} r={node.r} color="white" />
          {hatchLines}
        </Group>
      ) : (
        <Circle cx={0} cy={0} r={node.r} color={color} />
      )}
      <Circle
        cx={0}
        cy={0}
        r={node.r}
        style="stroke"
        strokeWidth={0.5}
        color="rgba(0,0,0,0.1)"
      />
    </Group>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
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
