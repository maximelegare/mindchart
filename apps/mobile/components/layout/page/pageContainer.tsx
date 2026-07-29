import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useScrollToTop,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import Animated, {
  clamp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { Gradient } from "@/components/ui/gradient";
import { gutter, Gutter } from "@/components/ui/gutter";
import { HeaderContent } from "@/components/layout/shared/headerContent";

import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { MoreOptionsMenuProps } from "../header/moreOptions/moreOptionsMenu";
import { IconName } from "@/components/ui/icons/icon-registry";
import { useTabChromeStore } from "../tabs/tabChromeStore";

const { HEADER_HEIGHT, HEADER_OVERLAP, OPTIONS_HEADER_HEIGHT } = LAYOUT_SIZES;

const SIDE_GUTTER = 4;
const PAGE_TOP_RADIUS = 24;

type HeaderVariant = "stack" | "tab" | "none";

type PageContainerProps = {
  title?: string;
  subtitle?: {
    text: string;
    icon?: IconName;
  };
  /** Replaces the default subtitle row when provided. */
  subtitleContent?: React.ReactNode;
  showLogo?: boolean;
  headerVariant?: HeaderVariant;
  /** Force-hide the back button (also hidden for stack headers / when nothing to pop). */
  hideBackButton?: boolean;
  buttons?: React.ReactNode[];
  children: React.ReactNode;
  noScrollView?: boolean;
  collapsingHeader?: boolean;
  moreOptionsMenu?: {
    state: { open: boolean; setOpen: (open: boolean) => void };
    links: MoreOptionsMenuProps["links"];
    /**
     * Header trigger content.
     * - `IconName`: show that icon
     * - `"currentWorkspace"` / omitted: show the workspace avatar
     */
    trigger?: MoreOptionsMenuProps["trigger"];
    /** Show the current workspace switcher in the menu. Defaults to true. */
    currentWorkspace?: boolean;
  };
  optionsHeader?: React.ReactNode;
  /** Hide the bottom tab bar while this page is focused. */
  hideTabBar?: boolean;
};

export const PageContainer = ({
  title,
  subtitle,
  subtitleContent,
  showLogo = false,
  headerVariant = "stack",
  hideBackButton = false,
  buttons,
  children,
  noScrollView = false,
  collapsingHeader = false,
  moreOptionsMenu,
  optionsHeader,
  hideTabBar = false,
}: PageContainerProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const animatedScrollRef = React.useRef<Animated.ScrollView>(null);
  const staticScrollRef = React.useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();

  useScrollToTop(collapsingHeader ? animatedScrollRef : staticScrollRef);

  // Hide while focused only — stack pushes (e.g. note → graph) keep this screen
  // mounted, so mount/unmount cleanup would leave the tab bar stuck hidden.
  useFocusEffect(
    React.useCallback(() => {
      if (!hideTabBar) return;
      useTabChromeStore.getState().setHidden(true);
      return () => {
        useTabChromeStore.getState().setHidden(false);
      };
    }, [hideTabBar])
  );

  const { colorScheme } = useColorScheme();
  const canGoBack = navigation.canGoBack();
  const resolvedTitle = title ?? "";
  const displayTitle =
    resolvedTitle.length > 25
      ? `${resolvedTitle.slice(0, 25)}...`
      : resolvedTitle;

  const showHeader = headerVariant !== "none";
  // Round heights to avoid sub-pixel layout rounding issues
  const headerHeight = Math.round(HEADER_HEIGHT + insets.top);
  const optionsOverlap = PAGE_TOP_RADIUS + 1;
  // Measure options bar height so expanded filter footers can push content.
  // The page underlaps the options chrome (see static layout below), so when
  // measurement lags the collapse animation the gap is page background — not
  // a flash of the header gradient.
  const [optionsHeaderHeight, setOptionsHeaderHeight] = React.useState(
    optionsHeader ? OPTIONS_HEADER_HEIGHT : 0
  );
  const chromeHeight = Math.round(
    headerHeight + (optionsHeader ? optionsHeaderHeight : 0)
  );
  const fixedGradientHeight = headerHeight + HEADER_OVERLAP;
  const useCollapsingHeader = collapsingHeader && showHeader && !noScrollView;

  const onOptionsHeaderLayout = React.useCallback((height: number) => {
    const next = Math.round(height);
    if (next > 0) {
      setOptionsHeaderHeight((prev) => (prev === next ? prev : next));
    }
  }, []);

  // Track raw scroll and the previous frame scroll synchronously on the UI thread
  const scrollY = useSharedValue(0);
  const previousScrollY = useSharedValue(0);
  const filteredScroll = useSharedValue(0);

  // Calculate filtered scroll directly inside the scroll handler to guarantee zero-frame lag
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      scrollY.value = y;

      if (y <= 0) {
        filteredScroll.value = 0;
        previousScrollY.value = y;
        return;
      }

      const dy = y - previousScrollY.value;

      // Update filtered scroll immediately in the same tick
      filteredScroll.value = clamp(filteredScroll.value + dy, 0, chromeHeight);

      previousScrollY.value = y;
    },
    onBeginDrag: (event) => {
      previousScrollY.value = event.contentOffset.y;
    },
  });

  // Native-driven translation
  const chromeTranslateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -filteredScroll.value }],
    };
  });

  const fullWidthGradientStyle = {
    width: windowWidth,
    marginLeft: -SIDE_GUTTER,
    marginRight: -SIDE_GUTTER,
  };

  const fixedGradient = showHeader ? (
    <Gradient
      type="linear"
      variant="primary"
      theme={colorScheme}
      style={[
        styles.fixedGradient,
        {
          height: fixedGradientHeight,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
        },
      ]}
    />
  ) : null;

  // Without optionsHeader, round the page sheet so fixedGradient shows in the corners.
  const pageNeedsTopRadius = showHeader && !optionsHeader;

  const headerBlock = (
    <Gradient
      type="linear"
      variant="primary"
      theme={colorScheme}
      className="h-auto"
      style={[
        fullWidthGradientStyle,
        {
          paddingTop: insets.top,
          paddingBottom: optionsHeader ? optionsOverlap : 0,
        },
      ]}
    >
      <View style={[styles.headerBar, { paddingHorizontal: SIDE_GUTTER }]}>
        <HeaderContent
          title={displayTitle}
          subtitle={subtitle}
          subtitleContent={subtitleContent}
          showLogo={showLogo}
          hideBackButton={
            hideBackButton || headerVariant === "stack" || !canGoBack
          }
          buttons={buttons}
          moreOptionsMenu={moreOptionsMenu}
        />
      </View>
    </Gradient>
  );

  // Static non-collapsing implementation
  if (!useCollapsingHeader) {
    // Underlap the page under the options header so any transient gap while the
    // footer collapse animates (before layout reports the new height) is filled
    // with page background, not a flash of the header gradient.
    const pageMarginTop = showHeader
      ? optionsHeader
        ? headerHeight
        : chromeHeight
      : 0;
    const pagePaddingTop = optionsHeader ? optionsHeaderHeight : 0;

    return (
      <View style={styles.root}>
        {fixedGradient}
        {showHeader && (
          <View style={styles.chrome} collapsable={false}>
            {headerBlock}
            {optionsHeader ? (
              <View
                style={styles.optionsOverlap}
                onLayout={(event) => {
                  onOptionsHeaderLayout(event.nativeEvent.layout.height);
                }}
              >
                {optionsHeader}
              </View>
            ) : null}
          </View>
        )}
        <View
          className="flex-1 bg-background"
          style={[
            styles.pageContainer,
            gutter(),
            showHeader && { marginTop: pageMarginTop },
            pagePaddingTop > 0 && { paddingTop: pagePaddingTop },
            pageNeedsTopRadius && {
              borderTopLeftRadius: PAGE_TOP_RADIUS,
              borderTopRightRadius: PAGE_TOP_RADIUS,
            },
          ]}
        >
          {noScrollView ? (
            <View
              className={
                optionsHeader
                  ? "relative flex-1 min-h-0"
                  : "relative flex-1 min-h-0 mt-6"
              }
            >
              <Gutter size="md" className="flex-1 min-h-0">
                {children}
              </Gutter>
            </View>
          ) : (
            <ScrollView
              ref={staticScrollRef}
              className="flex-1"
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                !optionsHeader && { paddingTop: 24 },
              ]}
            >
              <Gutter size="md">{children}</Gutter>
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {fixedGradient}

      <View
        className="flex-1 bg-background"
        style={[styles.pageContainer, gutter()]}
      >
        <Animated.ScrollView
          className="flex-1"
          ref={animatedScrollRef}
          onScroll={scrollHandler}
          scrollEventThrottle={16} // Guarantees 60fps/120fps tracking updates
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Reserve space for headers to sit over */}
          <View style={{ height: chromeHeight }} />
          <Gutter size="md">{children}</Gutter>
        </Animated.ScrollView>
      </View>

      {/* Split layout layers: Rendered above the pageContainer to avoid overlap issues */}
      <Animated.View
        pointerEvents="box-none"
        collapsable={false}
        style={[styles.chrome, { height: headerHeight }, chromeTranslateStyle]}
      >
        {headerBlock}
      </Animated.View>

      {optionsHeader ? (
        <Animated.View
          pointerEvents="box-none"
          collapsable={false}
          style={[
            styles.optionsChrome,
            { top: headerHeight },
            chromeTranslateStyle,
          ]}
          onLayout={(event) => {
            onOptionsHeaderLayout(event.nativeEvent.layout.height);
          }}
        >
          {optionsHeader}
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fixedGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  chrome: {
    position: "absolute",
    top: 0,
    left: SIDE_GUTTER,
    right: SIDE_GUTTER,
    zIndex: 20,
  },
  optionsChrome: {
    position: "absolute",
    left: SIDE_GUTTER,
    right: SIDE_GUTTER,
    zIndex: 21,
  },
  headerBar: {
    height: HEADER_HEIGHT,
    justifyContent: "center",
  },
  optionsOverlap: {
    marginTop: -(PAGE_TOP_RADIUS + 1),
    zIndex: 1,
  },
  pageContainer: {
    flex: 1,
    zIndex: 10,
    overflow: "hidden",
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
