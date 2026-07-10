import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { X } from "@/lib/icons/Times";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTabBar } from "./tabBar";
import { TabViewSwitcher } from "./tabViewSwitcher";
import { FloatingModalTab, FloatingModalTabId } from "../types/types";
import { RecorderView } from "../views/ai/recorder";
import { KeyboardView } from "../views/ai/keyboard";
import { ManualEntryView } from "../views/manualEntry";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";

const DEFAULT_TABS: FloatingModalTab[] = [
  {
    id: "create",
    label: "Recorder",
    icon: "mic",
    render: () => <RecorderView />,
  },
  {
    id: "keyboard",
    label: "Keyboard",
    icon: "keyboard",
    render: () => <KeyboardView />,
  },
  {
    id: "manual",
    label: "Manual",
    icon: "pencil",
    render: () => <ManualEntryView />,
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
  const creationMode = useNoteCreationStore((state) => state.creationMode);
  const inputView = useNoteCreationStore((state) => state.inputView);
  const setCreationMode = useNoteCreationStore(
    (state) => state.setCreationMode
  );
  const setInputView = useNoteCreationStore((state) => state.setInputView);

  const handleTabChange = (tabId: FloatingModalTabId) => {
    setActiveTab(tabId);
    if (tabId === "manual") {
      setCreationMode("manual");
    } else {
      setCreationMode("ai");
      if (tabId === "create") {
        setInputView("audio");
      } else if (tabId === "keyboard") {
        setInputView("input");
      }
    }
  };

  useEffect(() => {
    if (creationMode === "manual") {
      setActiveTab("manual");
    } else if (activeTab === "manual") {
      setActiveTab(inputView === "input" ? "keyboard" : "create");
    }
  }, [creationMode]);

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
          onTabChange={handleTabChange}
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
        <View className="min-h-0 flex-1">
          <TabViewSwitcher
            tabs={tabs}
            activeTab={activeTab}
            fadeMs={TAB_BODY_FADE_MS}
          />
        </View>
      ) : (
        <View className="flex-1" />
      )}
    </View>
  );
};
