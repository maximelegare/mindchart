import { View } from "react-native";
import { NewWorkspace } from "./newWorkspaces/newWorkspace";
import { ManageWorkspaceLayout } from "./manageWorkspace";

export function WorkspacesSheetContent() {
  return (
    <View className="flex-col gap-4 py-2">
      <NewWorkspace />
      <ManageWorkspaceLayout />
    </View>
  );
}
