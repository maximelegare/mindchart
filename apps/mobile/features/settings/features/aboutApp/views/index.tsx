import { Typography } from "@/components/ui/typography";
import { View } from "react-native";
import { AppVersionFeature } from "../features/appVersion";
import List, { ListHeader } from "@/components/ui/list";

export const AboutAppFeature = () => {
  return (
    <View className="flex-col gap-4">
      <List>
        <ListHeader>
          <Typography>General</Typography>
        </ListHeader>
        <AppVersionFeature />
      </List>
    </View>
  );
};
