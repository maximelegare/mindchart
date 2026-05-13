import React, { useMemo, useEffect, useRef } from "react";
import { Dimensions, View, StyleSheet, Pressable } from "react-native";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";
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
import { NodeDatum } from "@/features/graph/types/types";
import { CategoryKey } from "@repo/sqlite";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIZE = SCREEN_WIDTH - 24;

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
  layout: Layout;
} | null = null;

const getOrComputeLayout = (
  data: NodeDatum,
  padding: number
): { layout: Layout; hitReason: "ref" | "sig" | "miss" } => {
  if (cachedLayoutEntry && cachedLayoutEntry.dataRef === data) {
    return { layout: cachedLayoutEntry.layout, hitReason: "ref" };
  }
  const signature = computeSignature(data);
  if (cachedLayoutEntry && cachedLayoutEntry.signature === signature) {
    cachedLayoutEntry = {
      dataRef: data,
      signature,
      layout: cachedLayoutEntry.layout,
    };
    return { layout: cachedLayoutEntry.layout, hitReason: "sig" };
  }
  const layout = computeLayout(data, padding);
  cachedLayoutEntry = { dataRef: data, signature, layout };
  return { layout, hitReason: "miss" };
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

interface Props {
  data: NodeDatum;
  focusedThoughtId?: string;
  trigger?: string | number;
  onNodeSelected?: (node: NodeDatum, parent?: NodeDatum) => void;
}

export default function CirclePackSkia({
  data,
  focusedThoughtId,
  trigger,
  onNodeSelected,
}: Props) {
  const { colorScheme } = useColorScheme();
  const padding = 5;

  // This ref prevents the useEffect from overwriting a tap-initiated animation
  const isTransitioningInternal = useRef(false);

  // ---------- 1. Process Hierarchy & Layout ----------
  const { rootNode, allNodes, nodeMap } = useMemo(() => {
    const { layout } = getOrComputeLayout(data, padding);
    return layout;
  }, [data]);

  // ---------- 2. Shared Values ----------
  const viewX = useSharedValue(rootNode.x);
  const viewY = useSharedValue(rootNode.y);
  const viewR = useSharedValue(rootNode.r);
  const activeInternalId = useSharedValue(rootNode.internalId);
  const previousInternalId = useSharedValue(rootNode.internalId);

  // ---------- 3. Camera Helper ----------
  const navigateToNode = (node: NodeInfo, isToggleBack = false) => {
    if (!isToggleBack) {
      previousInternalId.value = activeInternalId.value;
    }

    activeInternalId.value = node.internalId;
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
    // If we are already moving because the user tapped a circle,
    // don't restart the animation from the effect.
    if (isTransitioningInternal.current) {
      isTransitioningInternal.current = false;
      return;
    }

    let target = rootNode;
    if (focusedThoughtId) {
      const found = allNodes.find((n) => n.dbId === String(focusedThoughtId));
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

        if (activeInternalId.value === targetToProcess.internalId) {
          const prev = nodeMap.get(previousInternalId.value);
          if (prev) runOnJS(navigateToNode)(prev, true);
        } else {
          runOnJS(navigateToNode)(targetToProcess, false);
        }
        break;
      }
    }
  });

  const handleZoomOut = () => {
    // Zooming out via button should NOT block the effect,
    // so we don't set isTransitioningInternal to true here.
    const current = nodeMap.get(activeInternalId.value);
    if (current?.parentId) {
      const parent = nodeMap.get(current.parentId);
      if (parent) navigateToNode(parent, false);
    } else if (current && current.internalId !== rootNode.internalId) {
      navigateToNode(rootNode, false);
    }
  };

  // ---------- 6. Dynamic Color Logic ----------
  const getNodeColor = (node: NodeInfo) => {
    if (!node.hasChildren) return "white";
    if (node.depth === 0) return hsl("card", colorScheme);

    const rawCat =
      node.rawData.categoryId ||
      (node.rawData.children && node.rawData.children[0]?.categoryId);

    const cat = rawCat?.toLowerCase() as CategoryKey;

    if (!cat) return hsl("border", colorScheme);

    const palette = [
      hsl("card", colorScheme),
      hsl(cat, colorScheme, undefined, "categories"),
      hsl(cat, colorScheme, 50, "categories"),
    ];

    return palette[node.depth] || palette[palette.length - 1];
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.wrapper,
          {
            backgroundColor: hsl("card", colorScheme),
            borderColor: hsl("border", colorScheme),
          },
        ]}
      >
        <GestureDetector gesture={tap}>
          <Canvas style={{ width: SIZE, height: SIZE }}>
            {allNodes.map((node) => (
              <SkCircle
                key={node.internalId}
                node={node}
                viewX={viewX}
                viewY={viewY}
                viewR={viewR}
                color={getNodeColor(node)}
              />
            ))}
          </Canvas>
        </GestureDetector>

        <Pressable onPress={handleZoomOut} style={styles.zoomBtn}>
          <Icon name="zoom-out" color="text" />
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
}

const SkCircle = ({ node, viewX, viewY, viewR, color }: any) => {
  const transform = useDerivedValue(() => {
    const k = SIZE / (viewR.value * 2);
    return [
      { translateX: SIZE / 2 + (node.x - viewX.value) * k },
      { translateY: SIZE / 2 + (node.y - viewY.value) * k },
      { scale: k },
    ];
  });

  return (
    <Group transform={transform}>
      <Circle cx={0} cy={0} r={node.r} color={color} />
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
    height: SIZE,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
  },
  zoomBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
