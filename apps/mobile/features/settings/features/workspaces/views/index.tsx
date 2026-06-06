import { View } from "react-native";
import List from "@/components/ui/list";
import { ManageWorkspaceLayout } from "../components/manageWorkspace";
import { RecoveryPasswordRow } from "../components/databaseRecoveryRow";
import { NewWorkspace } from "../components/newWorkspaces/newWorkspace";

export const WorkspaceSettingsFeature = () => {
  return (
    <View className="flex-col gap-4">
      <NewWorkspace />

      <ManageWorkspaceLayout />
      <List>
        <RecoveryPasswordRow />
      </List>
    </View>
  );
};
