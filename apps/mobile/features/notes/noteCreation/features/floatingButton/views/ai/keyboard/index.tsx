import React from "react";
import { Keyboard, View } from "react-native";
import { TextInputFeature } from "@/features/notes/noteCreation/features/textInput/textInput";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { GenerateNote } from "@/features/notes/noteCreation/features/generateNote/components/index";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { AiModelRequired } from "@/features/notes/noteCreation/features/floatingButton/components/aiModelRequired";

/** Button height (h-11) + bottom padding inside the white card. */
const GENERATE_OVERLAY_INSET = 60;

export const KeyboardView = () => {
  const inputValue = useNoteCreationStore((state) => state.inputValue);
  const setInputValue = useNoteCreationStore((state) => state.setInputValue);
  const fileURI = useNoteCreationStore((state) => state.fileURI);
  const resetInputs = useNoteCreationStore((state) => state.resetInputs);
  const { deleteFile } = useFileSystem();
  const { isReady: isLlamaReady } = useLlamaChat();
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleGenerateSuccess = () => {
    if (fileURI) {
      deleteFile(fileURI);
    }
    resetInputs();
  };

  if (!isLlamaReady) {
    return (
      <AiModelRequired message="Initialize Llama Chat in Settings to use text input." />
    );
  }

  return (
    <View className="flex-1 min-h-0 px-3 py-3">
      <TextInputFeature
        onChange={setInputValue}
        value={inputValue}
        keyboardHeight={keyboardHeight}
        compact
        overlayInset={GENERATE_OVERLAY_INSET}
        overlay={
          <GenerateNote
            fileURI={fileURI}
            inputText={inputValue}
            currentView="input"
            onSuccess={handleGenerateSuccess}
            size="md"
          />
        }
      />
    </View>
  );
};
