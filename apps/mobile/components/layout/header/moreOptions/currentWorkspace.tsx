import { Typography } from "@/components/ui";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icons/icon";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspaceAvatar";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export const CurrentWorkspace = () => {
  const { activeWorkspace } = useWorkSpaces();
  const { push } = useRouter();
  if (!activeWorkspace) return null;
  return (
    <DropdownMenuItem
      className="px-2 flex-row justify-between gap-3 items-center"
      onPress={() => {
        setTimeout(() => {
          push("/settings/workspaces");
        }, 150);
      }}
    >
      <View className="flex-row items-center gap-2 py-3">
        <WorkspaceAvatar size="sm" />
        <Typography variant="p" className="text-popover-foreground">
          {activeWorkspace?.name?.slice(0, 20)}
        </Typography>
      </View>

      <Icon name="arrow-right-left" size={20} color="background" />
    </DropdownMenuItem>
  );
};
