import ListItem from "@/components/ui/list-item";
import { Typography } from "@/components/ui/typography";
import Constants from "expo-constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { settingsAppVersionLabel } from "@/features/settings/settingsLabels";

export const AppVersionFeature = () => {
  const version = Constants.expoConfig?.extra?.version;
  const { colorScheme } = useColorScheme();

  return (
    <ListItem
      label={settingsAppVersionLabel()}
      borderBottom={false}
      noChevron
      detail={false}
      itemRight={() => (
        <Typography
          variant="p"
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          {version}
        </Typography>
      )}
    />
  );
};
