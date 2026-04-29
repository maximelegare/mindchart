import ListItem from "@/components/ui/list-item";
import { Typography } from "@/components/ui/typography";
import Constants from "expo-constants";

export const AppVersionFeature = () => {
  const version = Constants.expoConfig?.extra?.version;

  return (
    <ListItem
      className="bg-background"
      itemLeft={() => <></>}
      label="App Version"
      itemRight={() => <Typography variant="h4">{version}</Typography>}
      onPress={() => {}}
    />
  );
};
