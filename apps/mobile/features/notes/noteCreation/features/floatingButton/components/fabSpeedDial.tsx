import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import {
  CREATE_ACTION_COLORS,
  type CreateActionKey,
} from "@repo/theme/createActions";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const ACTION_SIZE = 48;
/** Must match FloatingModal FAB size so the dial sits just above it. */
export const FAB_SPEED_DIAL_FAB_SIZE = 72;
export const FAB_SPEED_DIAL_FAB_GAP = 10;
export const FAB_SPEED_DIAL_ITEM_GAP = 10;
export const FAB_SPEED_DIAL_ACTION_SIZE = ACTION_SIZE;

export function getFabSpeedDialHeight(actionCount: number) {
  if (actionCount <= 0) return 0;
  return (
    FAB_SPEED_DIAL_FAB_GAP +
    actionCount * ACTION_SIZE +
    (actionCount - 1) * FAB_SPEED_DIAL_ITEM_GAP
  );
}

const FAB_SIZE = FAB_SPEED_DIAL_FAB_SIZE;
const FAB_GAP = FAB_SPEED_DIAL_FAB_GAP;
const ITEM_GAP = FAB_SPEED_DIAL_ITEM_GAP;
const STAGGER_MS = 45;
const ANIM_MS = 220;

function toHsl(channels: string) {
  return channels.startsWith("hsl(") ? channels : `hsl(${channels})`;
}

export type FabSpeedDialAction = {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
  /** Maps to CREATE_ACTION_COLORS for icon + label accents. */
  createAction?: CreateActionKey;
};

type FabSpeedDialProps = {
  open: boolean;
  actions: FabSpeedDialAction[];
};

type FabSpeedDialItemProps = {
  action: FabSpeedDialAction;
  open: boolean;
  /** 0 = closest to FAB. */
  indexFromFab: number;
  count: number;
};

const FabSpeedDialItem = ({
  action,
  open,
  indexFromFab,
  count,
}: FabSpeedDialItemProps) => {
  const progress = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const actionColors = action.createAction
    ? CREATE_ACTION_COLORS[scheme][action.createAction]
    : null;

  const iconBackground = actionColors
    ? toHsl(actionColors.background)
    : hsl("popover", colorScheme);
  const labelBackground = actionColors
    ? toHsl(actionColors.label)
    : hsl("card", colorScheme);
  const labelColor = actionColors
    ? toHsl(actionColors.labelForeground)
    : hsl("card-foreground", colorScheme);
  const iconHslColor = actionColors
    ? toHsl(actionColors.foreground)
    : undefined;
  const borderColor = hsl("background", colorScheme);

  // Open from nearest-to-FAB first; close in reverse.
  const openDelay = indexFromFab * STAGGER_MS;
  const closeDelay = (count - 1 - indexFromFab) * STAGGER_MS;

  useEffect(() => {
    progress.value = withDelay(
      open ? openDelay : closeDelay,
      withTiming(open ? 1 : 0, {
        duration: ANIM_MS,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [closeDelay, open, openDelay, progress]);

  // Pin each action just above the FAB (index 0 = nearest).
  const bottom = FAB_SIZE + FAB_GAP + indexFromFab * (ACTION_SIZE + ITEM_GAP);

  const style = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [10, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity: progress.value,
      transform: [
        { translateY },
        { scale: interpolate(progress.value, [0, 1], [0.85, 1]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.item,
        {
          bottom,
          right: (FAB_SIZE - ACTION_SIZE) / 2,
        },
        style,
      ]}
      pointerEvents={open ? "auto" : "none"}
    >
      <Pressable
        onPress={action.onPress}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={action.label}
      >
        <View
          style={[
            styles.labelChip,
            {
              backgroundColor: labelBackground,
            },
          ]}
        >
          <Typography variant="h4" style={{ color: labelColor }}>
            {action.label}
          </Typography>
        </View>
        <View
          style={[
            styles.actionButton,
            {
              backgroundColor: iconBackground,
              borderColor,
            },
          ]}
        >
          <Icon name={action.icon} size={20} hslColor={iconHslColor} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const FabSpeedDial = ({ open, actions }: FabSpeedDialProps) => {
  // Render nearest-to-FAB last in the array so it sits above siblings for hits.
  const ordered = [...actions].reverse();

  return (
    <View style={styles.host} pointerEvents={open ? "box-none" : "none"}>
      {ordered.map((action, reversedIndex) => {
        const indexFromFab = reversedIndex;
        return (
          <FabSpeedDialItem
            key={action.key}
            action={action}
            open={open}
            indexFromFab={indexFromFab}
            count={actions.length}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Fills the FAB box; items are absolutely pinned above it via `bottom`.
  host: {
    ...StyleSheet.absoluteFillObject,
  },
  item: {
    position: "absolute",
    alignItems: "flex-end",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  labelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
