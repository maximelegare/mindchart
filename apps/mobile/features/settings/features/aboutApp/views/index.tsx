import { View } from "react-native";
import { AppVersionFeature } from "../features/appVersion";
import List from "@/components/ui/list";
import { SourceCodeFeature } from "../features/sourceCode";

export const AboutAppFeature = () => {
  return (
    <View className="flex-col gap-4">
      <List>
        <AppVersionFeature />
        <SourceCodeFeature />
      </List>
    </View>
  );
};
