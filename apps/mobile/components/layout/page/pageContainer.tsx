import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScrollToTop, useNavigation } from "@react-navigation/native";

import { Gradient } from "@/components/ui/gradient";
import { gutter, Gutter } from "@/components/ui/gutter";
import { HeaderContent } from "@/components/layout/shared/headerContent";
import { cn } from "@/lib/cn";

import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { MoreOptionsMenuProps } from "../header/moreOptions/moreOptionsMenu";

const { HEADER_HEIGHT, HEADER_OVERLAP } = LAYOUT_SIZES;

type HeaderVariant = "stack" | "tab" | "none";

type PageContainerProps = {
  title?: string;
  headerVariant?: HeaderVariant;
  buttons?: React.ReactNode;
  children: React.ReactNode;
  noScrollView?: boolean;
  moreOptionsMenu?: {
    state: { open: boolean; setOpen: (open: boolean) => void };
    links: MoreOptionsMenuProps["links"];
  };
};

export const PageContainer = ({
  title,
  headerVariant = "stack",
  buttons,
  children,
  noScrollView = false,
  moreOptionsMenu,
}: PageContainerProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollRef = React.useRef<ScrollView>(null);

  useScrollToTop(scrollRef);

  const { colorScheme } = useColorScheme();
  const canGoBack = navigation.canGoBack();

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
              title={title ?? ""}
              hideBackButton={headerVariant === "stack" || !canGoBack}
              buttons={buttons}
              moreOptionsMenu={moreOptionsMenu}
            />
          </Gutter>
        </View>
      )}

      <View
        className={cn("relative  z-10 flex-1  bg-background rounded-t-3xl")}
        style={{
          ...gutter(),
          marginTop: HEADER_HEIGHT + insets.top - HEADER_OVERLAP,
        }}
      >
        <View className="relative flex-1 mt-6">
          {!noScrollView ? (
            <ScrollView className="gap-y-6" ref={scrollRef}>
              <Gutter size="md">{children}</Gutter>
            </ScrollView>
          ) : (
            <Gutter size="md">{children}</Gutter>
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
    paddingBottom: 40,
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
});
