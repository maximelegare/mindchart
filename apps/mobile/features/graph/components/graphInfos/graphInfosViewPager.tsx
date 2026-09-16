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

type MountedPages = Record<GraphInfosContentView, boolean>;

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
  const [mounted, setMounted] = useState<MountedPages>({
    tree: view === "tree",
    notes: view === "notes",
  });
  const widthSV = useSharedValue(0);
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const notesMountedSV = useSharedValue(view === "notes");
  const treeMountedSV = useSharedValue(view === "tree");

  const mountPage = useCallback((page: GraphInfosContentView) => {
    setMounted((prev) => (prev[page] ? prev : { ...prev, [page]: true }));
  }, []);

  const releaseInactive = useCallback(
    (active: GraphInfosContentView) => {
      // Tree is expensive to rebuild — keep it mounted after the first paint.
      // Notes stay lazy and unmount when you snap back to the tree.
      notesMountedSV.value = active === "notes";
      treeMountedSV.value = true;
      setMounted({
        tree: true,
        notes: active === "notes",
      });
    },
    [notesMountedSV, treeMountedSV]
  );

  const settle = useCallback(
    (next: GraphInfosContentView) => {
      releaseInactive(next);
      onChange(next);
    },
    [onChange, releaseInactive]
  );

  useEffect(() => {
    if (width <= 0) return;
    widthSV.value = width;
    mountPage(view);
    if (isDragging.value) return;
    const target = view === "notes" ? -width : 0;
    if (Math.abs(translateX.value - target) < 0.5) {
      releaseInactive(view);
      return;
    }
    translateX.value = withTiming(
      target,
      { duration: SNAP_DURATION_MS, easing: SNAP_EASING },
      (finished) => {
        if (!finished) return;
        runOnJS(releaseInactive)(view);
      }
    );
  }, [
    isDragging,
    mountPage,
    releaseInactive,
    translateX,
    view,
    width,
    widthSV,
  ]);

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
          if (event.translationX < -8 && !notesMountedSV.value) {
            notesMountedSV.value = true;
            runOnJS(mountPage)("notes");
          } else if (event.translationX > 8 && !treeMountedSV.value) {
            treeMountedSV.value = true;
            runOnJS(mountPage)("tree");
          }
          const next = startX.value + event.translationX;
          translateX.value = Math.min(0, Math.max(-pageWidth, next));
        })
        .onEnd((event) => {
          isDragging.value = false;
          const pageWidth = widthSV.value;
          if (pageWidth <= 0) return;
          const projected = translateX.value + event.velocityX * 0.2;
          const goingNotes = projected < -pageWidth / 2;
          const target = goingNotes ? -pageWidth : 0;
          translateX.value = withTiming(
            target,
            { duration: SNAP_DURATION_MS, easing: SNAP_EASING },
            (finished) => {
              if (!finished) return;
              runOnJS(settle)(goingNotes ? "notes" : "tree");
            }
          );
        })
        .onFinalize(() => {
          isDragging.value = false;
        }),
    [
      isDragging,
      mountPage,
      notesMountedSV,
      settle,
      startX,
      translateX,
      treeMountedSV,
      widthSV,
    ]
  );

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth <= 0 || nextWidth === width) return;
    setWidth(nextWidth);
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        collapsable={false}
        onLayout={onLayout}
        style={{ overflow: "hidden", width: "100%" }}
      >
        <Animated.View
          collapsable={false}
          style={[
            {
              flexDirection: "row",
              alignItems: "flex-start",
              width: width > 0 ? width * 2 : "200%",
            },
            trackStyle,
          ]}
        >
          <View style={{ width: width > 0 ? width : "50%" }}>
            {mounted.tree ? tree : null}
          </View>
          <View style={{ width: width > 0 ? width : "50%" }}>
            {mounted.notes ? notes : null}
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};
