import { View } from "react-native";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { OptionsBar } from "../components/optionsBar/components/optionsBar";
import { UiGetter } from "../components/uiGetter";

export const ContentListFeature = () => {
  return (
    <View>
      <OptionsBar />
      <UiGetter />
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP", 15] }}
      />
    </View>
  );
};
