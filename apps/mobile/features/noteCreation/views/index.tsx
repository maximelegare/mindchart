import { Gutter } from "@/components/ui/gutter";
import React from "react";
import { GenerateNote } from "@/features/noteCreation/features/generateNote/index";
import { View } from "react-native";
import { AudioFeature } from "@/features/noteCreation/features/audio/views/index";
import ModeToggle from "@/components/ui/modeToggle";
import ViewSwitcher from "@/components/ui/viewSwitcher";
import { TextInputFeature } from "@/features/noteCreation/features/textInput/textInput";
import { useFileSystem } from "@/hooks/useFileSystem";

export function NoteCreationFeature() {
  const [fileURI, setFileURI] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"audio" | "input">("audio");

  const { deleteFile } = useFileSystem();
  const handleSuccess = () => {
    if (fileURI) {
      deleteFile(fileURI);
      setFileURI(null);
    }
    setInputValue("");
  };

  const [inputValue, setInputValue] = React.useState<string>("");
  return (
    <Gutter>
      <View className="w-full flex-row justify-end">
        <ModeToggle
          values={{
            first: { name: "audio", icon: "mic" },
            second: { name: "input", icon: "keyboard" },
          }}
          currentMode={view}
          onToggle={(newMode) => setView(newMode as "audio" | "input")}
        />
      </View>

      {/* Use the Switcher as the main container */}
      <View style={{ height: 550, marginTop: 20 }}>
        <ViewSwitcher
          currentMode={view}
          firstMode="audio"
          firstComponent={
            <AudioFeature onFileURIChange={setFileURI} fileURI={fileURI} />
          }
          secondComponent={
            <TextInputFeature onChange={setInputValue} value={inputValue} />
          }
        />
      </View>

      {/* Generate button stays outside the switcher so it's always visible */}
      <View className="mt-10 items-center">
        <GenerateNote
          fileURI={fileURI}
          inputText={inputValue}
          currentView={view}
          onSuccess={handleSuccess}
        />
      </View>
    </Gutter>
  );
}
