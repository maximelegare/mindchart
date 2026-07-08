import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { X } from "@/lib/icons/Times";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTabBar } from "./tabBar";
import { TabViewSwitcher } from "./tabViewSwitcher";
import { FloatingModalTab, FloatingModalTabId } from "./types";

const DEFAULT_TABS: FloatingModalTab[] = [
  {
    id: "create",
    label: "Create",
    icon: "plus",
    content: (
      <View className="flex-1 px-4 pt-3">
        <Typography className="text-popover-foreground">
          Create a note
        </Typography>
      </View>
    ),
  },
  {
    id: "browse",
    label: "Browse",
    icon: "search",
    content: (
      <View className="flex-1 px-4 pt-3">
        <Typography className="text-popover-foreground">
          Browse notes
        </Typography>
      </View>
    ),
  },
  {
    id: "recent",
    label: "Recent",
    icon: "notebook-text",
    content: (
      <View className="flex-1 px-4 pt-3">
        <Typography className="text-popover-foreground">
          Recent notes
        </Typography>
      </View>
    ),
  },
];

const HEADER_FADE_MS = 150;
const TAB_BODY_FADE_MS = 200;

type FloatingModalTabsProps = {
  tabs?: FloatingModalTab[];
  onClose: () => void;
  mountTabContent?: boolean;
};

export const FloatingModalTabs = ({
  tabs = DEFAULT_TABS,
  onClose,
  mountTabContent = true,
}: FloatingModalTabsProps) => {
  const { colorScheme } = useColorScheme();
  const headerOpacity = useSharedValue(0);
  const [activeTab, setActiveTab] = useState<FloatingModalTabId>(
    tabs[0]?.id ?? "create"
  );

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: HEADER_FADE_MS });
  }, [headerOpacity]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  return (
    <View className="flex-1 min-h-0">
      <Animated.View
        style={[
          headerStyle,
          {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: hsl("border", colorScheme),
          },
        ]}
        className="flex-row items-center pr-1"
      >
        <FloatingModalTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <Button
          onPress={onClose}
          variant="ghost"
          size="icon"
          accessibilityLabel="Close floating modal"
        >
          <X className="text-popover-foreground" size={24} />
        </Button>
      </Animated.View>

      {mountTabContent ? (
        <TabViewSwitcher
          tabs={tabs}
          activeTab={activeTab}
          fadeMs={TAB_BODY_FADE_MS}
        />
      ) : (
        <View className="flex-1" />
      )}
    </View>
  );
};
