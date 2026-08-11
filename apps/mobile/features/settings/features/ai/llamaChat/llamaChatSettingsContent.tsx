import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Typography } from "@/components/ui/typography";
import { hsl } from "@/utils/hsl";
import { Button } from "@/components/ui";
import { CHAT_MODELS } from "@/features/llama/data/models/chat/chatModels";
import { useColorScheme } from "@/lib/useColorScheme";

export type LlamaChatSettingsContentProps = {
  currentModelId: string | null;
  isDownloading: boolean;
  activeDownloadModelId: string | null;
  isInitializingChat: boolean;
  downloadProgress: Record<string, number>;
  downloadedModels: Record<string, unknown>;
  onInitialize: (modelKey: string) => void;
  onRelease: () => void;
  onDelete: (modelKey: string) => void;
};

export function LlamaChatSettingsContent({
  currentModelId,
  isDownloading,
  activeDownloadModelId,
  isInitializingChat,
  downloadProgress,
  downloadedModels,
  onInitialize,
  onRelease,
  onDelete,
}: LlamaChatSettingsContentProps) {
  const { colorScheme } = useColorScheme();
  const divider = {
    borderBottomWidth: 1,
    borderBottomColor: hsl("border", colorScheme),
  };
  const modelEntries = Object.entries(CHAT_MODELS);

  return (
    <View className="py-2">
      <View className="pb-4" style={divider}>
        <Typography padding>
          Local Large Language Model responsible for the summarization of notes.
          Large models require more VRAM and storage but provide better
          accuracy.
        </Typography>
      </View>

      <View className="py-4" style={divider}>
        <Typography
          variant="h4"
          padding
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          Engine Status
        </Typography>
        <View className="py-2 flex-row items-center">
          <View className="flex-1">
            <Typography
              variant="h4"
              style={{
                fontSize: 12,
                color: hsl("muted-foreground", colorScheme),
              }}
            >
              Active Context
            </Typography>
            <Typography variant="h3" padding>
              {currentModelId ? currentModelId.replace(/_/g, " ") : "Idle"}
            </Typography>
          </View>
          {isInitializingChat ? (
            <ActivityIndicator color={hsl("foreground", colorScheme)} />
          ) : currentModelId ? (
            <Button onPress={onRelease} variant="destructive" size="sm">
              <Typography>Unload from RAM</Typography>
            </Button>
          ) : null}
        </View>
      </View>

      <View className="pt-4">
        <Typography
          variant="h4"
          padding
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          Available Models
        </Typography>
        <View className="flex-col">
          {modelEntries.map(([key, model], index) => {
            const isDownloaded = !!downloadedModels[key];
            const isActive = currentModelId === key;
            const progress = downloadProgress[key] || 0;
            const downloadingThis =
              isDownloading && activeDownloadModelId === key;
            const isLast = index === modelEntries.length - 1;

            return (
              <View
                key={key}
                className="py-3 flex-row items-center"
                style={[
                  !isLast ? divider : null,
                  { opacity: isActive ? 1 : 0.55 },
                ]}
              >
                <View className="flex-1">
                  <Typography variant="h4" padding>
                    {model.name}
                  </Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    {isDownloaded
                      ? `Local · ${model.size}`
                      : `Cloud · ${model.size} download`}
                  </Typography>
                </View>

                <View className="flex-row items-center gap-2">
                  {isDownloaded && !isActive && !isInitializingChat && (
                    <Button
                      onPress={() => onDelete(key)}
                      variant="ghost"
                      size="sm"
                    >
                      <Typography
                        style={{ color: hsl("muted-foreground", colorScheme) }}
                      >
                        Delete
                      </Typography>
                    </Button>
                  )}

                  <Button
                    onPress={() => onInitialize(key)}
                    disabled={isDownloading || isInitializingChat || isActive}
                    variant={isActive ? "outline" : "default"}
                    size="sm"
                    style={
                      isActive
                        ? {
                            backgroundColor: "transparent",
                            borderColor: hsl("border", colorScheme),
                          }
                        : {
                            backgroundColor: hsl("primary", colorScheme),
                            borderColor: hsl("primary", colorScheme),
                          }
                    }
                  >
                    {downloadingThis ? (
                      <Typography
                        style={{
                          color: hsl("primary-foreground", colorScheme),
                        }}
                      >
                        {progress > 0 && progress < 100
                          ? `${progress.toFixed(0)}%`
                          : "Downloading..."}
                      </Typography>
                    ) : (
                      <Typography
                        style={{
                          color: isActive
                            ? hsl("muted-foreground", colorScheme)
                            : hsl("primary-foreground", colorScheme),
                        }}
                      >
                        {isDownloaded
                          ? isActive
                            ? "Loaded"
                            : "Load"
                          : "Download"}
                      </Typography>
                    )}
                  </Button>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
