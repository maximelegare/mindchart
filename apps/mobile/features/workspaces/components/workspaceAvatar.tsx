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
        "w-10 h-10 border-[1px] border-border rounded-full bg-primary items-center justify-center",
        size === "sm" ? "w-8 h-8" : "w-10 h-10"
      )}
    >
      <Typography
        variant={size === "sm" ? "p" : "h3"}
        className="text-popover-foreground"
      >
        {activeWorkspace?.name?.slice(0, 2)?.toUpperCase()}
      </Typography>
    </View>
  );
};
