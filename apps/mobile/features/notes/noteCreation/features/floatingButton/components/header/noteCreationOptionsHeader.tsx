import ModeToggle from "@/components/ui/modeToggle";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { View } from "react-native";
import {
  CreationMode,
  InputView,
  useNoteCreationStore,
} from "../../../../context/noteCreationContext";

const CREATION_MODE_VALUES = {
  first: { name: "ai", icon: "sparkles" as const },
  second: { name: "manual", icon: "pencil" as const },
};

const INPUT_VIEW_VALUES = {
  first: { name: "audio", icon: "mic" as const },
  second: { name: "input", icon: "keyboard" as const },
};

export const NoteCreationOptionsHeader = () => {
  const creationMode = useNoteCreationStore((state) => state.creationMode);
  const inputView = useNoteCreationStore((state) => state.inputView);
  const setCreationMode = useNoteCreationStore(
    (state) => state.setCreationMode
  );
  const setInputView = useNoteCreationStore((state) => state.setInputView);

  return (
    <PageOptionsHeaderContainer>
      <View className="flex-row items-center justify-between w-full">
        <ModeToggle
          values={CREATION_MODE_VALUES}
          currentMode={creationMode}
          onToggle={(mode) => setCreationMode(mode as CreationMode)}
        />

        {creationMode === "ai" ? (
          <ModeToggle
            values={INPUT_VIEW_VALUES}
            currentMode={inputView}
            onToggle={(mode) => setInputView(mode as InputView)}
          />
        ) : null}
      </View>
    </PageOptionsHeaderContainer>
  );
};
