import { View } from "react-native";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { FolderCardsList } from "../components/cards/folderCard/folderCardsList";
import { useOptionsBar } from "../components/optionsBar/context/optionBarContext";
import { UiGetter } from "../components/uiGetter";

export const ContentListFeature = () => {
  const showFolders = useOptionsBar((s) => s.foldersMode === "with");

  return (
    <View>
      {showFolders ? <FolderCardsList /> : null}
      <UiGetter />
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP", 15] }}
      />
    </View>
  );
};
