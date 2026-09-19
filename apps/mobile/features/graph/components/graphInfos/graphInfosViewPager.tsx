import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { GraphInfosContentView } from "./graphInfosViewToggle";

const SNAP_DURATION_MS = 240;
const SNAP_EASING = Easing.out(Easing.cubic);
const SNAP = { duration: SNAP_DURATION_MS, easing: SNAP_EASING };

type GraphInfosViewPagerProps = {
  view: GraphInfosContentView;
  onChange: (view: GraphInfosContentView) => void;
  tree: React.ReactNode;
  notes: React.ReactNode;
};

export const GraphInfosViewPager = ({
  view,
  onChange,
  tree,
  notes,
}: GraphInfosViewPagerProps) => {
  const [width, setWidth] = useState(0);
  const widthSV = useSharedValue(0);
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const treeHeightSV = useSharedValue(0);
  const notesHeightSV = useSharedValue(0);
  const viewportHeightSV = useSharedValue(0);

  const heightFor = useCallback(
    (active: GraphInfosContentView) => {
      const treeH = treeHeightSV.value;
      const notesH = notesHeightSV.value;
      if (active === "notes") return notesH > 0 ? notesH : treeH;
      return treeH > 0 ? treeH : notesH;
    },
    [notesHeightSV, treeHeightSV]
  );

  const animateHeight = useCallback(
    (active: GraphInfosContentView) => {
      const next = heightFor(active);
      if (next <= 0) return;
      if (viewportHeightSV.value <= 0) {
        viewportHeightSV.value = next;
        return;
      }
      if (Math.abs(viewportHeightSV.value - next) < 1) return;
      viewportHeightSV.value = withTiming(next, SNAP);
    },
    [heightFor, viewportHeightSV]
  );

  const settle = useCallback(
    (next: GraphInfosContentView) => {
      animateHeight(next);
      onChange(next);
    },
    [animateHeight, onChange]
  );

  useEffect(() => {
    if (width <= 0) return;
    widthSV.value = width;
    if (isDragging.value) return;
    animateHeight(view);
    const target = view === "notes" ? -width : 0;
    if (Math.abs(translateX.value - target) < 0.5) return;
    translateX.value = withTiming(target, SNAP);
  }, [animateHeight, isDragging, translateX, view, width, widthSV]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-24, 24])
        .onStart(() => {
          isDragging.value = true;
          startX.value = translateX.value;
        })
        .onUpdate((event) => {
          const pageWidth = widthSV.value;
          if (pageWidth <= 0) return;
          const next = startX.value + event.translationX;
          translateX.value = Math.min(0, Math.max(-pageWidth, next));
          const treeH = treeHeightSV.value;
          const notesH = notesHeightSV.value;
          if (treeH > 0 && notesH > 0) {
            const progress = Math.min(
              1,
              Math.max(0, -translateX.value / pageWidth)
            );
            viewportHeightSV.value = treeH + (notesH - treeH) * progress;
          }
        })
        .onEnd((event) => {
          isDragging.value = false;
          const pageWidth = widthSV.value;
          if (pageWidth <= 0) return;
          const projected = translateX.value + event.velocityX * 0.2;
          const goingNotes = projected < -pageWidth / 2;
          const target = goingNotes ? -pageWidth : 0;
          const treeH = treeHeightSV.value;
          const notesH = notesHeightSV.value;
          const targetH = goingNotes
            ? notesH > 0
              ? notesH
              : treeH
            : treeH > 0
              ? treeH
              : notesH;
          if (targetH > 0) {
            viewportHeightSV.value = withTiming(targetH, SNAP);
          }
          translateX.value = withTiming(target, SNAP, (finished) => {
            if (!finished) return;
            runOnJS(settle)(goingNotes ? "notes" : "tree");
          });
        })
        .onFinalize(() => {
          isDragging.value = false;
        }),
    [
      isDragging,
      notesHeightSV,
      settle,
      startX,
      translateX,
      treeHeightSV,
      viewportHeightSV,
      widthSV,
    ]
  );

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const viewportStyle = useAnimatedStyle(() => ({
    height: viewportHeightSV.value > 0 ? viewportHeightSV.value : undefined,
  }));

  const onWidthLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth <= 0 || nextWidth === width) return;
    setWidth(nextWidth);
  };

  const onPageLayout =
    (page: GraphInfosContentView) => (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (height <= 0) return;
      if (page === "tree") {
        if (Math.abs(treeHeightSV.value - height) < 0.5) return;
        treeHeightSV.value = height;
      } else {
        if (Math.abs(notesHeightSV.value - height) < 0.5) return;
        notesHeightSV.value = height;
      }
      if (isDragging.value || page !== view) return;
      if (viewportHeightSV.value <= 0 || page === "tree") {
        viewportHeightSV.value = height;
        return;
      }
      viewportHeightSV.value = withTiming(height, SNAP);
    };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        collapsable={false}
        onLayout={onWidthLayout}
        style={[{ overflow: "hidden", width: "100%" }, viewportStyle]}
      >
        <Animated.View
          collapsable={false}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              flexDirection: "row",
              alignItems: "flex-start",
              width: width > 0 ? width * 2 : "200%",
            },
            trackStyle,
          ]}
        >
          <View
            collapsable={false}
            onLayout={onPageLayout("tree")}
            style={{ width: width > 0 ? width : "50%" }}
          >
            {tree}
          </View>
          <View
            collapsable={false}
            onLayout={onPageLayout("notes")}
            style={{ width: width > 0 ? width : "50%" }}
          >
            {notes}
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
