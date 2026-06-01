import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { useWorkSpaces, Workspace } from "../hooks/useWorkSpaces";
import { Typography } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons/icon";
import { IconName } from "@/components/ui/icons/icon-registry";
import {
  DEFAULT_WORKSPACE_COLOR,
  parseWorkspaceColor,
} from "../utils/workspaceColor";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

export const WorkspaceAvatar = ({
  size = "md",
  workspace,
}: {
  size?: "sm" | "md";
  workspace?: Workspace;
}) => {
  const { activeWorkspace } = useWorkSpaces();
  const { colorScheme } = useColorScheme();
  const ws = workspace ?? activeWorkspace;

  if (!ws) return null;

  const sizePx = size === "sm" ? 28 : 36;
  const gradientColors =
    parseWorkspaceColor(ws.color) ?? DEFAULT_WORKSPACE_COLOR;

  return (
    <View
      className={cn(
        "border-[1px] rounded-full overflow-hidden items-center justify-center"
      )}
      style={{
        width: sizePx,
        height: sizePx,
        borderColor: hsl("background", colorScheme, 20),
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {ws.icon ? (
        <Icon
          hslColor="hsl(0, 0%, 100%)"
          name={ws.icon as IconName}
          size={size === "sm" ? 14 : 18}
        />
      ) : (
        <Typography
          variant={size === "sm" ? "lead" : "h3"}
          style={{ fontSize: size === "sm" ? 12 : 16 }}
        >
          {ws.name.slice(0, 2).toUpperCase()}
        </Typography>
      )}
    </View>
  );
};
