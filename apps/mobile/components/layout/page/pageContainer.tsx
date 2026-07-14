import React from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScrollToTop, useNavigation } from "@react-navigation/native";
import Animated, {
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

/** Matches `gutter()` / `gutter("sm")` side margins. */
const SIDE_GUTTER = 4;

/** Gap between header content and the top of page options. */
/** Matches PageOptionsHeaderContainer top radius — must sit over the header gradient. */
const PAGE_TOP_RADIUS = 24;

/** Reveal headers faster than they hide, so they come back easily. */
const REVEAL_FACTOR = 2;

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
  /** When true, header + options hide/show with scroll. Off by default. */
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
  const headerHeight = HEADER_HEIGHT + insets.top;
  const initialChromeHeight =
    headerHeight + (optionsHeader ? OPTIONS_HEADER_HEIGHT : 0);
  const fixedGradientHeight = headerHeight + HEADER_OVERLAP;
  const useCollapsingHeader = collapsingHeader && showHeader && !noScrollView;

  const chromeTranslateY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const chromeHeightSV = useSharedValue(initialChromeHeight);

  const onChromeLayout = (event: LayoutChangeEvent) => {
    chromeHeightSV.value = event.nativeEvent.layout.height;
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      "worklet";
      const y = event.contentOffset.y;
      const diff = y - lastScrollY.value;
      const maxHide = chromeHeightSV.value;

      if (y <= 0) {
        chromeTranslateY.value = 0;
      } else if (diff > 0) {
        chromeTranslateY.value = Math.max(
          -maxHide,
          chromeTranslateY.value - diff
        );
      } else if (diff < 0) {
        chromeTranslateY.value = Math.min(
          0,
          chromeTranslateY.value - diff * REVEAL_FACTOR
        );
      }

      lastScrollY.value = y;
    },
  });

  const chromeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: chromeTranslateY.value }],
  }));

  const contentSpacerStyle = useAnimatedStyle(() => ({
    height: chromeHeightSV.value,
  }));

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

  const headerChrome = showHeader ? (
    <>
      <Gradient
        type="linear"
        variant="primary"
        theme={colorScheme}
        className="h-auto"
        style={[
          fullWidthGradientStyle,
          {
            paddingTop: insets.top,
            paddingBottom: optionsHeader ? PAGE_TOP_RADIUS + 1 : 0,
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
      {optionsHeader ? (
        <View style={styles.optionsOverlap}>{optionsHeader}</View>
      ) : null}
    </>
  ) : null;

  // Static header (default) — including noScrollView pages.
  if (!useCollapsingHeader) {
    return (
      <View style={styles.root}>
        {fixedGradient}
        {showHeader && (
          <View style={styles.chrome} collapsable={false}>
            {headerChrome}
          </View>
        )}
        <View
          className="flex-1 bg-background"
          style={[
            styles.pageContainer,
            gutter(),
            showHeader && { marginTop: initialChromeHeight },
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
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={contentSpacerStyle} />
          <Gutter size="md">{children}</Gutter>
        </Animated.ScrollView>
      </View>

      <Animated.View
        onLayout={onChromeLayout}
        pointerEvents="box-none"
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        collapsable={false}
        style={[styles.chrome, chromeAnimatedStyle]}
      >
        {headerChrome}
      </Animated.View>
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
