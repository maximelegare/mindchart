import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  useKeyboardHandler,
  useKeyboardState,
} from "react-native-keyboard-controller";
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
const FAB_HORIZONTAL_GUTTER = 8;
const EXPANDED_HORIZONTAL_GUTTER = 4;
const FAB_BORDER_WIDTH = 2;
const EXPANDED_BORDER_WIDTH = 1;
/** Compact AI sheet docks under the page header and covers pageOptions. */
const EXPANDED_SHEET_HEIGHT = 200;
/** Ignore in-progress IME frames; real keyboards are taller than this. */
const MIN_KEYBOARD_HEIGHT = 200;
const SHEET_SIZE_MS = 280;
const SPEED_DIAL_ACTION_COUNT = 3;
const SPEED_DIAL_HEIGHT = getFabSpeedDialHeight(SPEED_DIAL_ACTION_COUNT);
/** Wide enough for action labels to the left of the FAB. */
const SPEED_DIAL_WIDTH = 220;

const sheetSizeTiming = {
  duration: SHEET_SIZE_MS,
  easing: Easing.out(Easing.cubic),
};

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
  const isKeyboardVisible = useKeyboardState((state) => state.isVisible);
  const { width: screenWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { TAB_BAR_HEIGHT } = LAYOUT_SIZES;
  const chromeHidden = useTabChromeStore((state) => state.hidden);
  const fabCloseNonce = useNoteCreationStore((state) => state.fabCloseNonce);
  const inputView = useNoteCreationStore((state) => state.inputView);
  /** 1 = text-input tab (keyboard-sized); 0 = recorder (fixed 200). */
  const followKeyboardSV = useSharedValue(inputView === "input" ? 1 : 0);
  /** 0 = not measured yet; otherwise last settled keyboard height. */
  const lastKeyboardHeightSV = useSharedValue(0);
  const animatedSheetHeightSV = useSharedValue(EXPANDED_SHEET_HEIGHT);
  /** Full window height while keyboard is closed (stable during adjustResize). */
  const layoutHeightSV = useSharedValue(
    Dimensions.get("window").height || windowHeight
  );
  const lastFabCloseNonceRef = useRef(fabCloseNonce);
  const setCreationMode = useNoteCreationStore(
    (state) => state.setCreationMode
  );

  useEffect(() => {
    followKeyboardSV.value = inputView === "input" ? 1 : 0;
  }, [followKeyboardSV, inputView]);

  // Keep a keyboard-closed window height so sheet math is not skewed by resize.
  useEffect(() => {
    if (!isKeyboardVisible && windowHeight > 0) {
      layoutHeightSV.value = windowHeight;
    }
  }, [isKeyboardVisible, layoutHeightSV, windowHeight]);

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
  const topOffset =
    (topOffsetProp ?? fabBottomOffset - tabBarTop) + EXPANDED_TOP_PADDING;

  const expandedWidth = screenWidth - EXPANDED_HORIZONTAL_GUTTER * 2;
  const expandedBottomRadius = useMemo(() => getExpandedBottomRadius(), []);

  const applySheetHeightForTab = (followKeyboard: number, animate: boolean) => {
    "worklet";
    const keyboardHeight = lastKeyboardHeightSV.value;
    const openHeight =
      followKeyboard === 1 && keyboardHeight >= MIN_KEYBOARD_HEIGHT
        ? Math.max(
            EXPANDED_SHEET_HEIGHT,
            layoutHeightSV.value - topOffset - keyboardHeight
          )
        : EXPANDED_SHEET_HEIGHT;

    if (animate) {
      animatedSheetHeightSV.value = withTiming(openHeight, sheetSizeTiming);
    } else {
      animatedSheetHeightSV.value = openHeight;
    }
  };

  // Capture only the settled keyboard height (not in-between IME frames).
  useKeyboardHandler(
    {
      onEnd: (event) => {
        "worklet";
        const keyboardHeight = Math.abs(event.height);
        if (event.progress !== 1 || keyboardHeight < MIN_KEYBOARD_HEIGHT) {
          return;
        }

        const hadSettledHeight =
          lastKeyboardHeightSV.value >= MIN_KEYBOARD_HEIGHT;
        lastKeyboardHeightSV.value = keyboardHeight;

        // First settled measurement on the text-input tab → animate 200 → slot.
        if (followKeyboardSV.value === 1 && !hadSettledHeight) {
          applySheetHeightForTab(1, true);
        }
      },
    },
    [topOffset]
  );

  // Animate only when switching recorder ↔ text-input.
  useAnimatedReaction(
    () => followKeyboardSV.value,
    (followKeyboard, previousFollow) => {
      if (previousFollow != null && followKeyboard === previousFollow) return;
      applySheetHeightForTab(followKeyboard, previousFollow != null);
    },
    [topOffset]
  );

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
    // Ensure shared values are fully reset before swapping back to the FAB.
    progress.value = 0;
    setSheetOpen(false);
    animateIconIn();
  }, [animateIconIn, progress]);

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

  const anchorStyle = useAnimatedStyle(() => {
    // Always position with `bottom` (never `top`) so collapsing cannot leave a
    // stale top offset that hides the FAB after the sheet closes.
    const openHeight = animatedSheetHeightSV.value;
    const openBottom = Math.max(
      0,
      layoutHeightSV.value - topOffset - openHeight
    );

    return {
      right: interpolate(
        progress.value,
        [0, 1],
        [FAB_HORIZONTAL_GUTTER, EXPANDED_HORIZONTAL_GUTTER],
        Extrapolation.CLAMP
      ),
      bottom: interpolate(
        progress.value,
        [0, 1],
        [fabBottomOffset, openBottom],
        Extrapolation.CLAMP
      ),
    };
  });

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
      [BUTTON_SIZE, animatedSheetHeightSV.value],
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
        // Remount on mode change so a previous `top` position cannot stick
        // around after collapsing the sheet (which hid the FAB).
        key={sheetOpen ? "sheet" : "fab"}
        pointerEvents="box-none"
        style={[
          styles.anchor,
          anchorStyle,
          !sheetOpen
            ? {
                width: SPEED_DIAL_WIDTH,
                height: BUTTON_SIZE + SPEED_DIAL_HEIGHT,
              }
            : null,
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
