import { View } from "react-native";
import { CreateWorkspaceRow } from "@/features/settings/features/workspaces/components/createWorkspaceRow";
import { ImportWorkspaceRow } from "@/features/settings/features/workspaces/components/importWorkspaceRow";
import List from "@/components/ui/list";
import { NewWorkspaceLayout } from "../components/newWorkspaceLayout";

export const WorkspaceSettingsFeature = () => {
  return (
    <View className="flex-col gap-4">
      <NewWorkspaceLayout />
      <List>
        <CreateWorkspaceRow />
        <ImportWorkspaceRow />
      </List>
    </View>
  );
};
