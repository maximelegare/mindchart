import { Gutter } from "@/components/ui/gutter";
import React from "react";
import { GenerateNote } from "@/features/notes/noteCreation/features/generateNote/components/index";
import { View } from "react-native";
import { AudioFeature } from "@/features/notes/noteCreation/features/audio/views/index";
import ModeToggle from "@/components/ui/modeToggle";
import ViewSwitcher from "@/components/ui/viewSwitcher";
import { TextInputFeature } from "@/features/notes/noteCreation/features/textInput/textInput";
import { ManualModeFeature } from "@/features/notes/noteCreation/features/manualMode/views/index";
import { useFileSystem } from "@/hooks/useFileSystem";

type CreationMode = "ai" | "manual";

export function NoteCreationFeature() {
  const [creationMode, setCreationMode] = React.useState<CreationMode>("ai");
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
      <View className="w-full flex-row justify-between items-center">
        <ModeToggle
          values={{
            first: { name: "ai", icon: "sparkles" },
            second: { name: "manual", icon: "pencil" },
          }}
          currentMode={creationMode}
          onToggle={(newMode) => setCreationMode(newMode as CreationMode)}
        />

        {creationMode === "ai" && (
          <ModeToggle
            values={{
              first: { name: "audio", icon: "mic" },
              second: { name: "input", icon: "keyboard" },
            }}
            currentMode={view}
            onToggle={(newMode) => setView(newMode as "audio" | "input")}
          />
        )}
      </View>

      <View style={{ height: 550, marginTop: 20 }}>
        {creationMode === "ai" ? (
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
        ) : (
          <ManualModeFeature />
        )}
      </View>

      {creationMode === "ai" && (
        <View className="mt-10 items-center">
          <GenerateNote
            fileURI={fileURI}
            inputText={inputValue}
            currentView={view}
            onSuccess={handleSuccess}
          />
        </View>
      )}
    </Gutter>
  );
}
