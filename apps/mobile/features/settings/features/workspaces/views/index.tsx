import { View } from "react-native";
import { ActiveWorkspaceHeader } from "@/features/workspaces/components/activeWorkspaceHeader";
import { WorkspacesList } from "@/features/workspaces/components/workspacesList";
import { CreateWorkspaceRow } from "@/features/workspaces/components/createWorkspaceRow";
import { ImportWorkspaceRow } from "@/features/workspaces/components/importWorkspaceRow";
import { ExportActiveWorkspaceRow } from "@/features/workspaces/components/exportActiveWorkspaceRow";
import List from "@/components/ui/list";

export const WorkspaceSettingsFeature = () => {
  return (
    <View className="flex-col gap-4">
      <ActiveWorkspaceHeader />
      <WorkspacesList />
      <List>
        <CreateWorkspaceRow />
        <ImportWorkspaceRow />
        <ExportActiveWorkspaceRow />
      </List>
    </View>
  );
};
