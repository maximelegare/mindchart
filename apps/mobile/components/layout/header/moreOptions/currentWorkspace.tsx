import { Typography } from "@/components/ui";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icons/icon";
import { WorkspaceAvatar } from "@/features/workspaces/components/manageWorkspaces/workspaceAvatar";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export const CurrentWorkspace = () => {
  const { activeWorkspace } = useWorkSpaces();
  const { push } = useRouter();
  if (!activeWorkspace) return null;

  return (
    <View className="">
      <DropdownMenuItem
        className="flex-row items-center rounded-2xl"
        onPress={() => {
          setTimeout(() => {
            push("/settings");
          }, 150);
        }}
      >
        <View className="flex-row items-center gap-2">
          <WorkspaceAvatar size="sm" />
          <View className="flex-col">
            <Typography
              variant="h4"
              className="text-popover-foreground p-0"
              style={{ lineHeight: 16 }}
            >
              {activeWorkspace.name?.length > 14
                ? activeWorkspace.name?.slice(0, 14) + "..."
                : activeWorkspace.name}
            </Typography>
            <View className="flex-row gap-1 items-center">
              <Typography
                variant="muted"
                style={{ fontSize: 10, lineHeight: 14 }}
              >
                Switch
              </Typography>
              <Icon
                name="arrow-right-left"
                size={12}
                opacity={30}
                color="popover-foreground"
              />
            </View>
          </View>
        </View>
      </DropdownMenuItem>
    </View>
  );
};
