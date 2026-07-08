import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useScrollToTop,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";

import { Gradient } from "@/components/ui/gradient";
import { gutter, Gutter } from "@/components/ui/gutter";
import { HeaderContent } from "@/components/layout/shared/headerContent";
import { cn } from "@/lib/cn";
import { FloatingModal } from "@/features/notes/noteCreation/features/floatingButton/views";

import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { MoreOptionsMenuProps } from "../header/moreOptions/moreOptionsMenu";
import { IconName } from "@/components/ui/icons/icon-registry";

const {
  HEADER_HEIGHT,
  HEADER_OVERLAP,
  TAB_BAR_HEIGHT,
  TAB_BAR_PADDING_COMPENSATION,
} = LAYOUT_SIZES;

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
  showFloatingButton?: boolean;
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
  showFloatingButton = false,
  moreOptionsMenu,
  optionsHeader,
}: PageContainerProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const scrollRef = React.useRef<ScrollView>(null);

  useScrollToTop(scrollRef);

  const { colorScheme } = useColorScheme();
  const canGoBack = navigation.canGoBack();
  const resolvedTitle = title ?? "";
  const displayTitle =
    resolvedTitle.length > 25
      ? `${resolvedTitle.slice(0, 25)}...`
      : resolvedTitle;

  const floatingBottomOffset =
    insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_PADDING_COMPENSATION + 16;

  const floatingTopOffset =
    headerVariant !== "none" ? HEADER_HEIGHT + insets.top - HEADER_OVERLAP : 12;

  return (
    <View style={styles.root}>
      {/* HEADER BACKGROUND LAYER (absolute, always behind) */}
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

      {/* HEADER CONTENT (above gradient) */}
      {headerVariant !== "none" && (
        <View
          style={[
            styles.headerContent,
            {
              //   paddingTop: insets.top,
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
          "relative  z-10 flex-1 overflow-hidden bg-background rounded-t-3xl"
        )}
        style={{
          ...gutter(),
          marginTop: HEADER_HEIGHT + insets.top - HEADER_OVERLAP,
        }}
      >
        <View
          className={cn("relative flex-1 min-h-0", !optionsHeader && "mt-6")}
        >
          {optionsHeader}
          {!noScrollView ? (
            <ScrollView className="gap-y-6" ref={scrollRef}>
              <Gutter size="md">{children}</Gutter>
            </ScrollView>
          ) : (
            <View className="flex-1 min-h-0">
              <Gutter size="md" className="flex-1 min-h-0">
                {children}
              </Gutter>
            </View>
          )}
        </View>
      </View>

      {showFloatingButton && isFocused && (
        <View style={styles.floatingModalLayer} pointerEvents="box-none">
          <FloatingModal
            bottomOffset={floatingBottomOffset}
            topOffset={floatingTopOffset}
          />
        </View>
      )}
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

  body: {
    flex: 1,
    backgroundColor: "white", // replace with theme token if needed
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    zIndex: 2,
    overflow: "hidden",
  },

  scrollContent: {
    paddingBottom: 24,
  },

  floatingModalLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },
});
