import React from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
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

/** How far options tuck over the header gradient. */
const HEADER_TUCK = 8;

/** Matches PageOptionsHeaderContainer top radius. */
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
  moreOptionsMenu,
  optionsHeader,
}: PageContainerProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollRef = React.useRef<Animated.ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();

  useScrollToTop(scrollRef);

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
    headerHeight + (optionsHeader ? OPTIONS_HEADER_HEIGHT - HEADER_TUCK : 0);
  const fixedGradientHeight = headerHeight + HEADER_OVERLAP;

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

  /**
   * Same full-width gradient recipe for fixed margins and the moving header,
   * so color stops line up. The moving one is clipped by the inset chrome.
   */
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
      style={[styles.fixedGradient, { height: fixedGradientHeight }]}
    />
  ) : null;

  const movingChrome = showHeader ? (
    <>
      <Gradient
        type="linear"
        variant="primary"
        theme={colorScheme}
        className="h-auto"
        style={[fullWidthGradientStyle, { paddingTop: insets.top }]}
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

  if (noScrollView) {
    return (
      <View style={styles.root}>
        {fixedGradient}
        {showHeader && (
          <View style={styles.chrome} collapsable={false}>
            {movingChrome}
          </View>
        )}
        <View
          className="flex-1 bg-background"
          style={[
            styles.pageContainer,
            gutter(),
            showHeader && { marginTop: headerHeight - HEADER_TUCK },
          ]}
        >
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
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Fixed full-width gradient — stays in the side margins when chrome moves */}
      {fixedGradient}

      <View
        className="flex-1 bg-background"
        style={[styles.pageContainer, gutter()]}
      >
        <Animated.ScrollView
          className="flex-1"
          ref={scrollRef}
          onScroll={showHeader ? scrollHandler : undefined}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {showHeader ? <Animated.View style={contentSpacerStyle} /> : null}
          <Gutter size="md">{children}</Gutter>
        </Animated.ScrollView>
      </View>

      {/* Inset chrome clips a full-width twin gradient so it matches the fixed one */}
      {showHeader && (
        <Animated.View
          onLayout={onChromeLayout}
          pointerEvents="box-none"
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
          collapsable={false}
          style={[styles.chrome, chromeAnimatedStyle]}
        >
          {movingChrome}
        </Animated.View>
      )}
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
    elevation: 20,
    overflow: "hidden",
  },

  headerBar: {
    height: HEADER_HEIGHT,
    justifyContent: "center",
  },

  optionsOverlap: {
    marginTop: -HEADER_TUCK,
    zIndex: 1,
  },

  pageContainer: {
    flex: 1,
    zIndex: 10,
    overflow: "hidden",
    borderTopLeftRadius: PAGE_TOP_RADIUS,
    borderTopRightRadius: PAGE_TOP_RADIUS,
  },

  scrollContent: {
    paddingBottom: 24,
  },
});
