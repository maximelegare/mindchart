import React from "react";
import { View } from "react-native";
import { useWorkSpaces, Workspace } from "../hooks/useWorkSpaces";
import { Typography } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons/icon";
import { IconName } from "@/components/ui/icons/icon-registry";

export const WorkspaceAvatar = ({
  size = "md",
  workspace,
}: {
  size?: "sm" | "md";
  workspace?: Workspace;
}) => {
  const { activeWorkspace } = useWorkSpaces();

  const ws = workspace || activeWorkspace;

  if (!ws) return null;
  return (
    <View
      className={cn(
        "border-[1px] border-border rounded-full bg-primary items-center justify-center"
      )}
      style={{
        width: size === "sm" ? 28 : 36,
        height: size === "sm" ? 28 : 36,
        backgroundColor: ws?.color,
      }}
    >
      {activeWorkspace?.icon ? (
        <Icon
          color="foreground"
          name={ws?.icon as IconName}
          size={size === "sm" ? 14 : 18}
        />
      ) : (
        <Typography
          variant={size === "sm" ? "lead" : "h3"}
          style={{ fontSize: size === "sm" ? 12 : 16 }}
        >
          {ws?.name.slice(0, 2)?.toUpperCase()}
        </Typography>
      )}
    </View>
  );
};
