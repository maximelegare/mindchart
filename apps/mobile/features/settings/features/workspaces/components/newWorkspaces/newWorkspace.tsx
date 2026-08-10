import { ImportWorkspaceRow } from "./importWorkspaceRow";
import { CreateWorkspaceRow } from "./createWorkspaceRow";
import { View } from "react-native";

export const NewWorkspace = () => {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1">
        <CreateWorkspaceRow />
      </View>
      <View className="flex-1">
        <ImportWorkspaceRow />
      </View>
    </View>
  );
};
