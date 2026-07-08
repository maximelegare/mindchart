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
import { FloatingModalTab, FloatingModalTabId } from "../types/types";
import { RecorderView } from "../views/ai/recorder";
import { KeyboardView } from "../views/ai/keyboard";
import { GenerateNote } from "@/features/notes/noteCreation/features/generateNote/components/index";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { useFileSystem } from "@/hooks/useFileSystem";

const DEFAULT_TABS: FloatingModalTab[] = [
  {
    id: "create",
    label: "Recorder",
    icon: "mic",
    content: <RecorderView />,
  },
  {
    id: "keyboard",
    label: "Keyboard",
    icon: "keyboard",
    content: <KeyboardView />,
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
  const creationMode = useNoteCreationStore((state) => state.creationMode);
  const inputView = useNoteCreationStore((state) => state.inputView);
  const fileURI = useNoteCreationStore((state) => state.fileURI);
  const inputValue = useNoteCreationStore((state) => state.inputValue);
  const setInputView = useNoteCreationStore((state) => state.setInputView);
  const resetInputs = useNoteCreationStore((state) => state.resetInputs);
  const { deleteFile } = useFileSystem();

  const handleGenerateSuccess = () => {
    if (fileURI) {
      deleteFile(fileURI);
    }
    resetInputs();
  };

  const handleTabChange = (tabId: FloatingModalTabId) => {
    setActiveTab(tabId);
    if (tabId === "create") {
      setInputView("audio");
    } else if (tabId === "keyboard") {
      setInputView("input");
    }
  };

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

      {creationMode === "ai" && (
        <View className="items-center px-4 pb-4 pt-2">
          <GenerateNote
            fileURI={fileURI}
            inputText={inputValue}
            currentView={inputView}
            onSuccess={handleGenerateSuccess}
          />
        </View>
      )}
    </View>
  );
};
