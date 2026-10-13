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
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Gradient } from "@/components/ui/gradient";
import { gutter, Gutter } from "@/components/ui/gutter";
import { HeaderContent } from "@/components/layout/shared/headerContent";

import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { MoreOptionsMenuProps } from "../header/moreOptions/moreOptionsMenu";
import { IconName } from "@/components/ui/icons/icon-registry";
import { useTabChromeStore } from "../tabs/tabChromeStore";

const { HEADER_HEIGHT, HEADER_OVERLAP, OPTIONS_HEADER_HEIGHT } = LAYOUT_SIZES;

const SIDE_GUTTER = 4;
const PAGE_TOP_RADIUS = 24;

export type ScrollToTopOptions = {
  animated?: boolean;
};

type PageScrollApi = {
  /** Returns true when the page was scrolled away from the top. */
  scrollToTop: (options?: ScrollToTopOptions) => boolean;
  scrollTo: (y: number, options?: ScrollToTopOptions) => void;
  getScrollOffset: () => number;
};

const PageScrollContext = React.createContext<PageScrollApi>({
  scrollToTop: () => false,
  scrollTo: () => {},
  getScrollOffset: () => 0,
});

export const usePageScroll = () => React.useContext(PageScrollContext);

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
  /** Actions rendered on the left of the header, after the back button when shown. */
  leftButtons?: React.ReactNode[];
  buttons?: React.ReactNode[];
  children: React.ReactNode;
  noScrollView?: boolean;
  collapsingHeader?: boolean;
  /**
   * When the collapsing header leaves the viewport, show a see-through
   * copy of the header actions (not the page options bar).
   */
  transparentHeader?: boolean;
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
  /** Top corner radius of the page sheet under the header. */
  pageTopRadius?: number;
  /**
   * When this value changes, keep the current scroll offset through the
   * following layout (edit/save, keyboard, editor height).
   */
  restoreScrollToken?: React.Key;
};

export const PageContainer = ({
  title,
  subtitle,
  subtitleContent,
  showLogo = false,
  headerVariant = "stack",
  hideBackButton = false,
  leftButtons,
  buttons,
  children,
  noScrollView = false,
  collapsingHeader = false,
  transparentHeader = false,
  moreOptionsMenu,
  optionsHeader,
  hideTabBar = false,
  pageTopRadius = PAGE_TOP_RADIUS,
  restoreScrollToken,
}: PageContainerProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const animatedScrollRef = React.useRef<Animated.ScrollView>(null);
  const staticScrollRef = React.useRef<ScrollView>(null);
  const staticScrollOffsetRef = React.useRef(0);
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
  // Side gutters intentionally reveal the root behind the page sheet; match the
  // header chrome so RN/nav default white never shows through (incl. dark mode).
  const chromeBackdrop = hsl(
    colorScheme === "dark" ? "footer" : "foreground",
    colorScheme
  );
  const pageBackground = hsl("background", colorScheme);
  const canGoBack = navigation.canGoBack();
  const resolvedTitle = title ?? "";
  const displayTitle =
    resolvedTitle.length > 25
      ? `${resolvedTitle.slice(0, 25)}...`
      : resolvedTitle;

  const showHeader = headerVariant !== "none";
  // Round heights to avoid sub-pixel layout rounding issues
  const headerHeight = Math.round(HEADER_HEIGHT + insets.top);
  const optionsOverlap = pageTopRadius + 1;
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
  const useTransparentHeader = useCollapsingHeader && transparentHeader;
  const [transparentHeaderActive, setTransparentHeaderActive] =
    React.useState(false);

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
  const lastUserScroll = useSharedValue(0);
  const isRestoringScroll = useSharedValue(false);
  const userDraggingScroll = useSharedValue(false);
  const transparentHeaderProgress = useSharedValue(0);
  const transparentHeaderTranslate = useSharedValue(0);
  const transparentHeaderVisible = useSharedValue(false);

  const scrollToTop = React.useCallback(
    (options?: ScrollToTopOptions) => {
      const animated = options?.animated ?? false;
      const offset = Math.max(scrollY.value, staticScrollOffsetRef.current);
      const wasScrolled = offset > 12;
      scrollY.value = 0;
      previousScrollY.value = 0;
      filteredScroll.value = 0;
      staticScrollOffsetRef.current = 0;
      animatedScrollRef.current?.scrollTo({ y: 0, animated });
      staticScrollRef.current?.scrollTo({ y: 0, animated });
      return wasScrolled;
    },
    [filteredScroll, previousScrollY, scrollY]
  );

  const scrollTo = React.useCallback(
    (y: number, options?: ScrollToTopOptions) => {
      const animated = options?.animated ?? false;
      const next = Math.max(0, y);
      animatedScrollRef.current?.scrollTo({ y: next, animated });
      staticScrollRef.current?.scrollTo({ y: next, animated });
    },
    []
  );

  const getScrollOffset = React.useCallback(
    () => Math.max(scrollY.value, staticScrollOffsetRef.current),
    [scrollY]
  );

  const pageScrollApi = React.useMemo(
    () => ({ scrollToTop, scrollTo, getScrollOffset }),
    [getScrollOffset, scrollTo, scrollToTop]
  );

  const showAtForHeader = Math.min(22, Math.max(14, headerHeight * 0.2));

  const snapTransparentHeaderOn = React.useCallback(() => {
    if (!useTransparentHeader) return;
    transparentHeaderVisible.value = true;
    transparentHeaderTranslate.value = 0;
    transparentHeaderProgress.value = 1;
    setTransparentHeaderActive(true);
  }, [
    transparentHeaderProgress,
    transparentHeaderTranslate,
    transparentHeaderVisible,
    useTransparentHeader,
  ]);

  const prevRestoreTokenRef = React.useRef(restoreScrollToken);
  React.useLayoutEffect(() => {
    if (restoreScrollToken === undefined) return;
    if (prevRestoreTokenRef.current === restoreScrollToken) return;
    prevRestoreTokenRef.current = restoreScrollToken;
    const currentY = Math.max(scrollY.value, staticScrollOffsetRef.current);
    const y = lastUserScroll.value;
    const headerCollapsed = filteredScroll.value >= showAtForHeader;
    // Edit/save: if the real header is already off-screen, show the overlay
    // immediately — don't wait for another drag.
    if (headerCollapsed) {
      snapTransparentHeaderOn();
    }
    // Stay put when already at the top (edit/save must not invent a scroll).
    if (currentY <= 16 || y <= 16 || filteredScroll.value <= 8) return;
    isRestoringScroll.value = true;
    const collapsed = Math.min(y, chromeHeight);
    const apply = () => {
      animatedScrollRef.current?.scrollTo({ y, animated: false });
      staticScrollRef.current?.scrollTo({ y, animated: false });
      scrollY.value = y;
      previousScrollY.value = y;
      filteredScroll.value = collapsed;
      if (useTransparentHeader && collapsed >= showAtForHeader) {
        snapTransparentHeaderOn();
      }
    };
    apply();
    const frame = requestAnimationFrame(apply);
    const later = setTimeout(apply, 80);
    const late = setTimeout(apply, 240);
    const done = setTimeout(() => {
      apply();
      isRestoringScroll.value = false;
      lastUserScroll.value = y;
    }, 480);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(later);
      clearTimeout(late);
      clearTimeout(done);
      isRestoringScroll.value = false;
    };
  }, [
    chromeHeight,
    filteredScroll,
    isRestoringScroll,
    lastUserScroll,
    previousScrollY,
    restoreScrollToken,
    scrollY,
    showAtForHeader,
    snapTransparentHeaderOn,
    useTransparentHeader,
  ]);

  // Calculate filtered scroll directly inside the scroll handler to guarantee zero-frame lag
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      scrollY.value = y;
      if (!isRestoringScroll.value) {
        lastUserScroll.value = y;
      } else {
        previousScrollY.value = y;
        return;
      }

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
      userDraggingScroll.value = true;
      previousScrollY.value = event.contentOffset.y;
    },
    onEndDrag: () => {
      userDraggingScroll.value = false;
    },
    onMomentumEnd: () => {
      userDraggingScroll.value = false;
      if (!useTransparentHeader) return;
      const showAt = Math.min(22, Math.max(14, headerHeight * 0.2));
      if (!transparentHeaderVisible.value && filteredScroll.value >= showAt) {
        runOnJS(snapTransparentHeaderOn)();
      }
    },
  });

  // Native-driven translation
  const chromeTranslateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -filteredScroll.value }],
    };
  });

  const transparentHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: transparentHeaderProgress.value,
      transform: [{ translateY: transparentHeaderTranslate.value }],
    };
  });

  const showTransparentHeader = React.useCallback(() => {
    setTransparentHeaderActive(true);
    requestAnimationFrame(() => {
      transparentHeaderTranslate.value = -16;
      transparentHeaderTranslate.value = withTiming(0, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      transparentHeaderProgress.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    });
  }, [transparentHeaderProgress, transparentHeaderTranslate]);

  const hideTransparentHeader = React.useCallback(() => {
    transparentHeaderTranslate.value = 0;
    transparentHeaderProgress.value = withTiming(
      0,
      {
        duration: 180,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (finished) {
          runOnJS(setTransparentHeaderActive)(false);
        }
      }
    );
  }, [transparentHeaderProgress, transparentHeaderTranslate]);

  useAnimatedReaction(
    () => filteredScroll.value,
    (y) => {
      if (isRestoringScroll.value) return;
      if (!useTransparentHeader) {
        if (transparentHeaderVisible.value) {
          transparentHeaderVisible.value = false;
          runOnJS(hideTransparentHeader)();
        }
        return;
      }
      const showAt = Math.min(22, Math.max(14, headerHeight * 0.2));
      const hideAt = 4;
      if (
        !transparentHeaderVisible.value &&
        y >= showAt &&
        userDraggingScroll.value
      ) {
        transparentHeaderVisible.value = true;
        runOnJS(showTransparentHeader)();
      } else if (transparentHeaderVisible.value && y <= hideAt) {
        transparentHeaderVisible.value = false;
        runOnJS(hideTransparentHeader)();
      }
    },
    [
      headerHeight,
      hideTransparentHeader,
      showTransparentHeader,
      useTransparentHeader,
    ]
  );

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

  const cloneHeaderActions = (
    nodes: React.ReactNode[] | undefined,
    slot: string
  ) =>
    nodes?.map((node, index) =>
      React.isValidElement(node) ? (
        <React.Fragment key={`${slot}-${index}`}>
          {React.cloneElement(node)}
        </React.Fragment>
      ) : (
        node
      )
    );

  const [overlayMenuOpen, setOverlayMenuOpen] = React.useState(false);
  const overlayMoreOptionsMenu = moreOptionsMenu
    ? {
        ...moreOptionsMenu,
        state: { open: overlayMenuOpen, setOpen: setOverlayMenuOpen },
      }
    : undefined;

  const renderHeaderContent = (slot: "main" | "overlay") => (
    <HeaderContent
      title={displayTitle}
      subtitle={subtitle}
      subtitleContent={subtitleContent}
      showLogo={showLogo}
      hideBackButton={hideBackButton || headerVariant === "stack" || !canGoBack}
      leftButtons={cloneHeaderActions(leftButtons, `${slot}-left`)}
      buttons={cloneHeaderActions(buttons, `${slot}-right`)}
      moreOptionsMenu={
        slot === "overlay" ? overlayMoreOptionsMenu : moreOptionsMenu
      }
    />
  );

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
        {renderHeaderContent("main")}
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
      <PageScrollContext.Provider value={pageScrollApi}>
        <View style={[styles.root, { backgroundColor: chromeBackdrop }]}>
          {fixedGradient}
          {showHeader && (
            <View style={styles.chrome} collapsable={false}>
              {headerBlock}
              {optionsHeader ? (
                <View
                  style={[
                    styles.optionsOverlap,
                    { marginTop: -(pageTopRadius + 1) },
                  ]}
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
            className="flex-1"
            style={[
              styles.pageContainer,
              gutter(),
              { backgroundColor: pageBackground },
              showHeader && { marginTop: pageMarginTop },
              pagePaddingTop > 0 && { paddingTop: pagePaddingTop },
              pageNeedsTopRadius && {
                borderTopLeftRadius: pageTopRadius,
                borderTopRightRadius: pageTopRadius,
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
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={false}
                automaticallyAdjustContentInsets={false}
                scrollEventThrottle={16}
                onScroll={(event) => {
                  staticScrollOffsetRef.current =
                    event.nativeEvent.contentOffset.y;
                }}
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
      </PageScrollContext.Provider>
    );
  }

  return (
    <PageScrollContext.Provider value={pageScrollApi}>
      <View style={[styles.root, { backgroundColor: chromeBackdrop }]}>
        {fixedGradient}

        <View
          className="flex-1"
          style={[
            styles.pageContainer,
            gutter(),
            { backgroundColor: pageBackground },
          ]}
        >
          <Animated.ScrollView
            className="flex-1"
            ref={animatedScrollRef}
            onScroll={scrollHandler}
            scrollEventThrottle={16} // Guarantees 60fps/120fps tracking updates
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={false}
            automaticallyAdjustContentInsets={false}
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
          style={[
            styles.chrome,
            { height: headerHeight },
            chromeTranslateStyle,
          ]}
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

        {useTransparentHeader ? (
          <Animated.View
            pointerEvents={transparentHeaderActive ? "box-none" : "none"}
            collapsable={false}
            shouldRasterizeIOS
            renderToHardwareTextureAndroid
            style={[styles.transparentChrome, transparentHeaderStyle]}
          >
            <View
              style={[
                styles.transparentBar,
                {
                  paddingTop: insets.top,
                  paddingBottom: 16,
                  backgroundColor: withAlpha(chromeBackdrop, 0.82),
                  borderBottomColor:
                    colorScheme === "dark"
                      ? "hsl(0, 0%, 32%)"
                      : "hsl(0, 0%, 66%)",
                },
              ]}
            >
              <View style={{ marginHorizontal: SIDE_GUTTER }}>
                <View
                  style={[
                    styles.headerBar,
                    fullWidthGradientStyle,
                    { paddingHorizontal: SIDE_GUTTER },
                  ]}
                >
                  {renderHeaderContent("overlay")}
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </PageScrollContext.Provider>
  );
};

function withAlpha(color: string, alpha: number): string {
  const clamped = Math.min(1, Math.max(0, alpha));
  if (color.startsWith("hsla(")) return color;
  if (color.startsWith("hsl(")) {
    return color.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${clamped})`);
  }
  return `hsla(${color}, ${clamped})`;
}

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
  transparentChrome: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  transparentBar: {
    borderBottomWidth: 1,
  },
  headerBar: {
    height: HEADER_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
  },
  optionsOverlap: {
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
