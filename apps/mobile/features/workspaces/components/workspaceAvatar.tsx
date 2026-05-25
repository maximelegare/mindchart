import React from "react";
import { View } from "react-native";
import { useWorkSpaces } from "../hooks/useWorkSpaces";
import { Typography } from "@/components/ui";
import { cn } from "@/lib/cn";

export const WorkspaceAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const { activeWorkspace } = useWorkSpaces();

  if (!activeWorkspace) return null;
  return (
    <View
      className={cn(
        "border-[1px] border-border rounded-full bg-primary items-center justify-center"
      )}
      style={{
        width: size === "sm" ? 28 : 36,
        height: size === "sm" ? 28 : 36,
      }}
    >
      <Typography
        variant={size === "sm" ? "lead" : "h3"}
        className="text-popover-foreground"
        style={{ fontSize: size === "sm" ? 12 : 16 }}
      >
        {activeWorkspace?.name?.slice(0, 2)?.toUpperCase()}
      </Typography>
    </View>
  );
};
