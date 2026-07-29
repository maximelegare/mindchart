import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCornerRadiusSync } from "expo-screen-corner-radius";
import { Icon } from "@/components/ui/icons/icon";
import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useTabChromeStore } from "@/components/layout/tabs/tabChromeStore";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTabs } from "@/features/notes/noteCreation/features/floatingButton/components/header";
import {
  FabSpeedDial,
  getFabSpeedDialHeight,
  type FabSpeedDialAction,
} from "@/features/notes/noteCreation/features/floatingButton/components/fabSpeedDial";
import type { FloatingModalTab } from "@/features/notes/noteCreation/features/floatingButton/types/types";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { useCreateBlankNote } from "@/features/notes/noteCreation/hooks/useCreateBlankNote";
import { useFolderActions } from "@/features/contentList/components/optionsBar/hooks/useFolderActions";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { useControllers } from "@/api/controllers/useControllers";

const BUTTON_SIZE = 72;
const BORDER_RADIUS = BUTTON_SIZE / 2;
const EXPANDED_TOP_BORDER_RADIUS = 20;
const EXPANDED_TOP_PADDING = 0;
const FAB_BOTTOM_GAP = 16;
const EXPANDED_BOTTOM_GAP = 4;
const FAB_HORIZONTAL_GUTTER = 8;
const EXPANDED_HORIZONTAL_GUTTER = 4;
const FAB_BORDER_WIDTH = 2;
const EXPANDED_BORDER_WIDTH = 1;
const SPEED_DIAL_ACTION_COUNT = 3;
const SPEED_DIAL_HEIGHT = getFabSpeedDialHeight(SPEED_DIAL_ACTION_COUNT);
/** Wide enough for action labels to the left of the FAB. */
const SPEED_DIAL_WIDTH = 220;

function getExpandedBottomRadius() {
  try {
    const deviceRadius = getCornerRadiusSync();
    if (deviceRadius != null && deviceRadius > 0) {
      return deviceRadius;
    }
  } catch {
    return EXPANDED_TOP_BORDER_RADIUS;
  }

  return EXPANDED_TOP_BORDER_RADIUS;
}

const ANIMATION_MS = 380;
const CHROME_FADE_MS = 180;
const ICON_FADE_MS = 220;
const TAB_CONTENT_DELAY_MS = 150;

const timingConfig = {
  duration: ANIMATION_MS,
  easing: Easing.out(Easing.cubic),
};

type FloatingModalProps = {
  children?: React.ReactNode;
  tabs?: FloatingModalTab[];
  bottomOffset?: number;
  topOffset?: number;
};

export const FloatingModal = ({
  children,
  tabs,
  bottomOffset: bottomOffsetProp,
  topOffset: topOffsetProp,
}: FloatingModalProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mountHeader, setMountHeader] = useState(false);
  const [mountTabContent, setMountTabContent] = useState(false);
  const tabContentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useSharedValue(0);
  const iconOpacity = useSharedValue(1);
  const chromeOpacity = useSharedValue(1);
  const menuIconProgress = useSharedValue(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { TAB_BAR_HEIGHT } = LAYOUT_SIZES;
  const chromeHidden = useTabChromeStore((state) => state.hidden);
  const fabCloseNonce = useNoteCreationStore((state) => state.fabCloseNonce);
  const lastFabCloseNonceRef = useRef(fabCloseNonce);
  const setCreationMode = useNoteCreationStore(
    (state) => state.setCreationMode
  );

  const { createBlankNote } = useCreateBlankNote();
  const { openCreateFolderModal } = useFolderActions();
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const { folders } = useControllers();
  const { data: allFolders } = folders.useFetchAllFoldersQuery();

  const currentFolder = useMemo(
    () => allFolders?.find((folder) => folder.id === currentFolderId) ?? null,
    [allFolders, currentFolderId]
  );

  const tabBarTop = insets.bottom + TAB_BAR_HEIGHT;
  const fabBottomOffset = bottomOffsetProp ?? tabBarTop + FAB_BOTTOM_GAP;
  const expandedBottomOffset = EXPANDED_BOTTOM_GAP;
  const topOffset =
    (topOffsetProp ?? fabBottomOffset - tabBarTop) + EXPANDED_TOP_PADDING;

  const expandedHeight = Math.max(
    BUTTON_SIZE,
    screenHeight - expandedBottomOffset - topOffset
  );
  const expandedWidth = screenWidth - EXPANDED_HORIZONTAL_GUTTER * 2;
  const expandedBottomRadius = useMemo(() => getExpandedBottomRadius(), []);

  const popoverColor = hsl("popover", colorScheme);
  const borderColor = hsl("background", colorScheme);

  const clearTabContentTimer = useCallback(() => {
    if (tabContentTimerRef.current) {
      clearTimeout(tabContentTimerRef.current);
      tabContentTimerRef.current = null;
    }
  }, []);

  const onExpandComplete = useCallback(() => {
    setMountHeader(true);
    clearTabContentTimer();
    tabContentTimerRef.current = setTimeout(() => {
      setMountTabContent(true);
      tabContentTimerRef.current = null;
    }, TAB_CONTENT_DELAY_MS);
  }, [clearTabContentTimer]);

  const animateIconIn = useCallback(() => {
    iconOpacity.value = 0;
    iconOpacity.value = withTiming(1, { duration: ICON_FADE_MS });
  }, [iconOpacity]);

  const onCollapseComplete = useCallback(() => {
    setSheetOpen(false);
    animateIconIn();
  }, [animateIconIn]);

  const expandSheet = useCallback(() => {
    clearTabContentTimer();
    setMenuOpen(false);
    menuIconProgress.value = withTiming(0, { duration: 160 });
    iconOpacity.value = 0;
    setCreationMode("ai");
    setSheetOpen(true);
    setMountHeader(false);
    setMountTabContent(false);
    progress.value = 0;
    progress.value = withTiming(1, timingConfig, (finished) => {
      if (finished) {
        runOnJS(onExpandComplete)();
      }
    });
  }, [
    clearTabContentTimer,
    iconOpacity,
    menuIconProgress,
    onExpandComplete,
    progress,
    setCreationMode,
  ]);

  const collapseSheet = useCallback(() => {
    clearTabContentTimer();
    setMountHeader(false);
    setMountTabContent(false);
    progress.value = withTiming(0, timingConfig, (finished) => {
      if (finished) {
        runOnJS(onCollapseComplete)();
      }
    });
  }, [clearTabContentTimer, onCollapseComplete, progress]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuIconProgress.value = withTiming(0, { duration: 160 });
  }, [menuIconProgress]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => {
      const next = !prev;
      menuIconProgress.value = withTiming(next ? 1 : 0, { duration: 180 });
      return next;
    });
  }, [menuIconProgress]);

  const handleCreateFolder = useCallback(() => {
    closeMenu();
    openCreateFolderModal(
      currentFolder
        ? { kind: "folder", folder: currentFolder }
        : { kind: "root" }
    );
  }, [closeMenu, currentFolder, openCreateFolderModal]);

  const handleCreateNote = useCallback(async () => {
    closeMenu();
    await createBlankNote();
  }, [closeMenu, createBlankNote]);

  const handleGenerateWithAi = useCallback(() => {
    expandSheet();
  }, [expandSheet]);

  // Top → bottom (closest to FAB last): note, folder, AI.
  const speedDialActions = useMemo<FabSpeedDialAction[]>(
    () => [
      {
        key: "note",
        label: "New note",
        icon: "notebook-text",
        createAction: "notes",
        onPress: () => {
          void handleCreateNote();
        },
      },
      {
        key: "folder",
        label: "New folder",
        icon: "folder",
        createAction: "folders",
        onPress: handleCreateFolder,
      },
      {
        key: "ai",
        label: "New AI generated",
        icon: "sparkles",
        createAction: "aiGenerated",
        onPress: handleGenerateWithAi,
      },
    ],
    [handleCreateFolder, handleCreateNote, handleGenerateWithAi]
  );

  useEffect(() => {
    if (fabCloseNonce === lastFabCloseNonceRef.current) return;
    lastFabCloseNonceRef.current = fabCloseNonce;
    if (sheetOpen) {
      collapseSheet();
    }
  }, [collapseSheet, fabCloseNonce, sheetOpen]);

  useEffect(() => () => clearTabContentTimer(), [clearTabContentTimer]);

  useEffect(() => {
    if (chromeHidden) {
      clearTabContentTimer();
      setMenuOpen(false);
      setSheetOpen(false);
      setMountHeader(false);
      setMountTabContent(false);
      progress.value = 0;
      menuIconProgress.value = 0;
      iconOpacity.value = 1;
      chromeOpacity.value = withTiming(0, { duration: CHROME_FADE_MS });
      return;
    }

    chromeOpacity.value = withTiming(1, { duration: CHROME_FADE_MS });
  }, [
    chromeHidden,
    clearTabContentTimer,
    chromeOpacity,
    iconOpacity,
    menuIconProgress,
    progress,
  ]);

  const anchorStyle = useAnimatedStyle(() => ({
    right: interpolate(
      progress.value,
      [0, 1],
      [FAB_HORIZONTAL_GUTTER, EXPANDED_HORIZONTAL_GUTTER],
      Extrapolation.CLAMP
    ),
    bottom: interpolate(
      progress.value,
      [0, 1],
      [fabBottomOffset, expandedBottomOffset],
      Extrapolation.CLAMP
    ),
  }));

  const shellStyle = useAnimatedStyle(() => ({
    width: interpolate(
      progress.value,
      [0, 1],
      [BUTTON_SIZE, expandedWidth],
      Extrapolation.CLAMP
    ),
    height: interpolate(
      progress.value,
      [0, 1],
      [BUTTON_SIZE, expandedHeight],
      Extrapolation.CLAMP
    ),
    borderWidth: interpolate(
      progress.value,
      [0, 1],
      [FAB_BORDER_WIDTH, EXPANDED_BORDER_WIDTH],
      Extrapolation.CLAMP
    ),
    borderTopLeftRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, EXPANDED_TOP_BORDER_RADIUS],
      Extrapolation.CLAMP
    ),
    borderTopRightRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, EXPANDED_TOP_BORDER_RADIUS],
      Extrapolation.CLAMP
    ),
    borderBottomLeftRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, expandedBottomRadius],
      Extrapolation.CLAMP
    ),
    borderBottomRightRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, expandedBottomRadius],
      Extrapolation.CLAMP
    ),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  const plusIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuIconProgress.value, [0, 1], [1, 0]),
    transform: [
      {
        rotate: `${interpolate(menuIconProgress.value, [0, 1], [0, 45])}deg`,
      },
      {
        scale: interpolate(menuIconProgress.value, [0, 1], [1, 0.6]),
      },
    ],
  }));

  const closeIconStyle = useAnimatedStyle(() => ({
    opacity: menuIconProgress.value,
    transform: [
      {
        rotate: `${interpolate(menuIconProgress.value, [0, 1], [-45, 0])}deg`,
      },
      {
        scale: interpolate(menuIconProgress.value, [0, 1], [0.6, 1]),
      },
    ],
  }));

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chromeOpacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: menuIconProgress.value * 0.35,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, chromeStyle]}
      pointerEvents={chromeHidden ? "none" : "box-none"}
    >
      {menuOpen && !sheetOpen ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeMenu}
          accessibilityRole="button"
          accessibilityLabel="Dismiss create menu"
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#000" },
              backdropStyle,
            ]}
          />
        </Pressable>
      ) : null}

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.anchor,
          sheetOpen
            ? anchorStyle
            : {
                right: FAB_HORIZONTAL_GUTTER,
                bottom: fabBottomOffset,
                width: SPEED_DIAL_WIDTH,
                height: BUTTON_SIZE + SPEED_DIAL_HEIGHT,
              },
        ]}
      >
        {!sheetOpen && (
          <View style={styles.fabStack} pointerEvents="box-none">
            <FabSpeedDial open={menuOpen} actions={speedDialActions} />
            <Pressable
              onPress={toggleMenu}
              style={[
                styles.fab,
                {
                  backgroundColor: popoverColor,
                  borderColor,
                  borderWidth: FAB_BORDER_WIDTH,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? "Close create menu" : "Create"}
            >
              <Animated.View style={[styles.iconLayer, iconStyle]}>
                <Animated.View style={[styles.iconAbsolute, plusIconStyle]}>
                  <Icon name="plus" size={32} color="popover-foreground" />
                </Animated.View>
                <Animated.View style={[styles.iconAbsolute, closeIconStyle]}>
                  <Icon name="plus" size={32} color="popover-foreground" />
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>
        )}

        {sheetOpen && (
          <Animated.View
            style={[
              styles.shell,
              shellStyle,
              {
                backgroundColor: popoverColor,
                borderColor,
              },
            ]}
          >
            {mountHeader &&
              (children ? (
                <View
                  style={[
                    styles.expandedContent,
                    { paddingTop: EXPANDED_TOP_PADDING },
                  ]}
                >
                  {mountTabContent && (
                    <View className="flex-1 min-h-0">{children}</View>
                  )}
                </View>
              ) : (
                <View
                  className="flex-1 min-h-0"
                  style={[
                    styles.expandedContent,
                    { paddingTop: EXPANDED_TOP_PADDING },
                  ]}
                >
                  <FloatingModalTabs
                    tabs={tabs}
                    onClose={collapseSheet}
                    mountTabContent={mountTabContent}
                  />
                </View>
              ))}
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    zIndex: 50,
    elevation: 50,
  },
  fabStack: {
    width: SPEED_DIAL_WIDTH,
    height: BUTTON_SIZE + SPEED_DIAL_HEIGHT,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  fab: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLayer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconAbsolute: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  shell: {
    overflow: "hidden",
  },
  expandedContent: {
    ...StyleSheet.absoluteFillObject,
  },
});
