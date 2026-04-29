import ListItem from "@/components/ui/list-item";
import { openExternalURL } from "@/features/settings/utils/openEternalUrl";

export const SourceCodeFeature = () => {
  return (
    <ListItem
      className="bg-background"
      itemLeft={() => <></>}
      label="Source Code"
      onPress={() =>
        openExternalURL("https://github.com/maximelegare/mindchart")
      }
    />
  );
};
