import { View } from "react-native";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { FolderCardsList } from "../components/cards/folderCard/folderCardsList";
import { UiGetter } from "../components/uiGetter";

export const ContentListFeature = () => {
  return (
    <View>
      <FolderCardsList />
      <UiGetter />
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP", 15] }}
      />
    </View>
  );
};
