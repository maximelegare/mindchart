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
    <View className="px-2 py-[5px]">
      <DropdownMenuItem
        className="flex-col rounded-xl justify-between gap-3 items-center border-border/30 border"
        onPress={() => {
          setTimeout(() => {
            push("/settings/workspaces");
          }, 150);
        }}
      >
        <View className="justify-center gap-1 items-center">
          <WorkspaceAvatar size="sm" />
          <Typography
            variant="p"
            className="text-popover-foreground opacity-70"
            style={{ fontSize: 12 }}
          >
            {activeWorkspace?.name?.length > 20
              ? activeWorkspace?.name?.slice(0, 20) + "..."
              : activeWorkspace?.name}
          </Typography>
        </View>
        <View className="flex-row justify-center gap-1 items-center py-1">
          <Typography
            variant="p"
            style={{ fontSize: 10 }}
            className="text-popover-foreground opacity-70"
          >
            Switch
          </Typography>
          <Icon
            name="arrow-right-left"
            style={{ opacity: 0.7 }}
            size={10}
            color="background"
          />
        </View>
      </DropdownMenuItem>
    </View>
  );
};
