import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useWorkSpaces } from "../../../../workspaces/hooks/useWorkSpaces";

export const ActiveWorkspaceHeader = () => {
  const { activeWorkspace } = useWorkSpaces();

  return (
    <View className="px-4 pt-2 pb-3">
      <Typography variant="muted">Active Workspace</Typography>
      <Typography variant="h3">{activeWorkspace?.name ?? "None"}</Typography>
    </View>
  );
};
