import { ImportWorkspaceRow } from "./importWorkspaceRow";
import { CreateWorkspaceRow } from "./createWorkspaceRow";
import { View } from "react-native";

export const NewWorkspace = () => {
  return (
    <View className="flex-row gap-4">
      <CreateWorkspaceRow />
      <ImportWorkspaceRow />
    </View>
  );
};
