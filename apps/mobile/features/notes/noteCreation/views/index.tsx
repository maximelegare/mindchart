import { Gutter } from "@/components/ui/gutter";
import React from "react";
import { GenerateNote } from "@/features/notes/noteCreation/features/generateNote/components/index";
import { View } from "react-native";
import { AudioFeature } from "@/features/notes/noteCreation/features/audio/views/index";
import ViewSwitcher from "@/components/ui/viewSwitcher";
import { TextInputFeature } from "@/features/notes/noteCreation/features/textInput/textInput";
import { ManualModeFeature } from "@/features/notes/noteCreation/features/manualEntry/views/index";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useNoteCreationStore } from "../context/noteCreationContext";

export function NoteCreationFeature() {
  const creationMode = useNoteCreationStore((state) => state.creationMode);
  const inputView = useNoteCreationStore((state) => state.inputView);

  const [fileURI, setFileURI] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState<string>("");

  const { deleteFile } = useFileSystem();

  const handleSuccess = () => {
    if (fileURI) {
      deleteFile(fileURI);
      setFileURI(null);
    }
    setInputValue("");
  };

  return (
    <Gutter className="flex-1 min-h-0">
      {creationMode === "ai" ? (
        <>
          <View style={{ height: 550 }} className="overflow-hidden flex-col">
            <ViewSwitcher
              currentMode={inputView}
              firstMode="audio"
              firstComponent={
                <AudioFeature onFileURIChange={setFileURI} fileURI={fileURI} />
              }
              secondComponent={
                <TextInputFeature onChange={setInputValue} value={inputValue} />
              }
            />
          </View>

          <View className="mt-10 items-center">
            <GenerateNote
              fileURI={fileURI}
              inputText={inputValue}
              currentView={inputView}
              onSuccess={handleSuccess}
            />
          </View>
        </>
      ) : (
        <View className="flex-1 min-h-0 overflow-hidden">
          <ManualModeFeature />
        </View>
      )}
    </Gutter>
  );
}
