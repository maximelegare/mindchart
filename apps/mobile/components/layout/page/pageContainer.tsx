import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScrollToTop, useNavigation } from "@react-navigation/native";
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
  showLogo?: boolean;
  headerVariant?: HeaderVariant;
  buttons?: React.ReactNode;
  children: React.ReactNode;
  noScrollView?: boolean;
  collapsingHeader?: boolean;
  moreOptionsMenu?: {
    state: { open: boolean; setOpen: (open: boolean) => void };
    links: MoreOptionsMenuProps["links"];
  };
  optionsHeader?: React.ReactNode;
};

export const PageContainer = ({
  title,
  subtitle,
  showLogo = false,
  headerVariant = "stack",
  buttons,
  children,
  noScrollView = false,
  collapsingHeader = false,
  moreOptionsMenu,
  optionsHeader,
}: PageContainerProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const animatedScrollRef = React.useRef<Animated.ScrollView>(null);
  const staticScrollRef = React.useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();

  useScrollToTop(collapsingHeader ? animatedScrollRef : staticScrollRef);

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
  const chromeHeight = Math.round(
    headerHeight + (optionsHeader ? OPTIONS_HEADER_HEIGHT : 0)
  );
  const fixedGradientHeight = headerHeight + HEADER_OVERLAP;
  const useCollapsingHeader = collapsingHeader && showHeader && !noScrollView;

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
          showLogo={showLogo}
          hideBackButton={headerVariant === "stack" || !canGoBack}
          buttons={buttons}
          moreOptionsMenu={moreOptionsMenu}
        />
      </View>
    </Gradient>
  );

  // Static non-collapsing implementation
  if (!useCollapsingHeader) {
    return (
      <View style={styles.root}>
        {fixedGradient}
        {showHeader && (
          <View style={styles.chrome} collapsable={false}>
            {headerBlock}
            {optionsHeader ? (
              <View style={styles.optionsOverlap}>{optionsHeader}</View>
            ) : null}
          </View>
        )}
        <View
          className="flex-1 bg-background"
          style={[
            styles.pageContainer,
            gutter(),
            showHeader && { marginTop: chromeHeight },
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
            { top: headerHeight, height: OPTIONS_HEADER_HEIGHT },
            chromeTranslateStyle,
          ]}
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
