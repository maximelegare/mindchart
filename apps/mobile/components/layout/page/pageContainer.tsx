import React from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
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
import { cn } from "@/lib/cn";

import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { MoreOptionsMenuProps } from "../header/moreOptions/moreOptionsMenu";
import { IconName } from "@/components/ui/icons/icon-registry";

const { HEADER_HEIGHT, HEADER_OVERLAP, OPTIONS_HEADER_HEIGHT } = LAYOUT_SIZES;

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

  useScrollToTop(scrollRef);

  const { colorScheme } = useColorScheme();
  const canGoBack = navigation.canGoBack();
  const resolvedTitle = title ?? "";
  const displayTitle =
    resolvedTitle.length > 25
      ? `${resolvedTitle.slice(0, 25)}...`
      : resolvedTitle;

  const [optionsHeight, setOptionsHeight] = React.useState(
    optionsHeader ? OPTIONS_HEADER_HEIGHT : 0
  );

  const optionsTranslateY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const optionsHeightSV = useSharedValue(
    optionsHeader ? OPTIONS_HEADER_HEIGHT : 0
  );

  const onOptionsLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setOptionsHeight(height);
    optionsHeightSV.value = height;
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const diff = y - lastScrollY.value;
      const maxHide = optionsHeightSV.value;

      if (y <= 0) {
        optionsTranslateY.value = 0;
      } else if (Math.abs(diff) > 0.5) {
        // Scroll into content → options header leaves with it.
        // Scroll back → options header returns on top of content.
        const next = optionsTranslateY.value - diff;
        optionsTranslateY.value = Math.min(0, Math.max(-maxHide, next));
      }

      lastScrollY.value = y;
    },
  });

  const optionsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: optionsTranslateY.value }],
  }));

  return (
    <View style={styles.root}>
      {headerVariant !== "none" && (
        <View
          style={[styles.headerBackgroundContainer, { height: HEADER_HEIGHT }]}
        >
          <Gradient
            type="linear"
            variant="primary"
            theme={colorScheme}
            style={{
              height: HEADER_HEIGHT + HEADER_OVERLAP + insets.top,
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
            }}
          />
        </View>
      )}

      {headerVariant !== "none" && (
        <View
          style={[
            styles.headerContent,
            {
              height: HEADER_HEIGHT + insets.top,
            },
          ]}
        >
          <Gutter size="sm">
            <HeaderContent
              title={displayTitle}
              subtitle={subtitle}
              showLogo={showLogo}
              hideBackButton={headerVariant === "stack" || !canGoBack}
              buttons={buttons}
              moreOptionsMenu={moreOptionsMenu}
            />
          </Gutter>
        </View>
      )}

      <View
        className={cn(
          "relative z-10 flex-1 overflow-hidden bg-background rounded-t-3xl"
        )}
        style={{
          ...gutter(),
          marginTop: HEADER_HEIGHT + insets.top - HEADER_OVERLAP,
        }}
      >
        <View
          className={cn("relative flex-1 min-h-0", !optionsHeader && "mt-6")}
        >
          {!noScrollView ? (
            <>
              <Animated.ScrollView
                className="flex-1"
                ref={scrollRef}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
              >
                {optionsHeader ? (
                  <View style={{ height: optionsHeight }} />
                ) : null}
                <Gutter size="md">{children}</Gutter>
              </Animated.ScrollView>

              {optionsHeader ? (
                <Animated.View
                  onLayout={onOptionsLayout}
                  pointerEvents="box-none"
                  style={[styles.stickyOptionsHeader, optionsAnimatedStyle]}
                >
                  {optionsHeader}
                </Animated.View>
              ) : null}
            </>
          ) : (
            <View className="flex-1 min-h-0">
              {optionsHeader}
              <Gutter size="md" className="flex-1 min-h-0">
                {children}
              </Gutter>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  headerBackgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },

  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    justifyContent: "flex-end",
    paddingBottom: 35,
  },

  stickyOptionsHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
});
