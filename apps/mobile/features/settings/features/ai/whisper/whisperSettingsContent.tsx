import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WHISPER_MODELS } from "@/features/whisper/data/whisperModels";
import { Typography } from "@/components/ui/typography";
import { hsl } from "@/utils/hsl";
import { Button } from "@/components/ui";
import { useColorScheme } from "@/lib/useColorScheme";

export type WhisperSettingsContentProps = {
  currentModelId: string | null;
  isDownloading: boolean;
  isInitializing: boolean;
  downloadProgress: Record<string, number>;
  modelFiles: Record<string, unknown>;
  onInitialize: (modelId: string) => void;
  onRelease: () => void;
  onDelete: (modelId: string) => void;
};

export function WhisperSettingsContent({
  currentModelId,
  isDownloading,
  isInitializing,
  downloadProgress,
  modelFiles,
  onInitialize,
  onRelease,
  onDelete,
}: WhisperSettingsContentProps) {
  const { colorScheme } = useColorScheme();
  const divider = {
    borderBottomWidth: 1,
    borderBottomColor: hsl("border", colorScheme),
  };

  return (
    <View className="py-2">
      <View className="pb-4" style={divider}>
        <Typography padding>
          AI Engine responsible for the local transcription of speech. Use Tiny
          for English and Base for other languages.
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
              {currentModelId ? currentModelId.toUpperCase() : "Idle"}
            </Typography>
          </View>
          {isInitializing ? (
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
          {WHISPER_MODELS.map((model, index) => {
            const isDownloaded = !!modelFiles[model.id];
            const isActive = currentModelId === model.id;
            const progress = downloadProgress[model.id] || 0;
            const downloadingThis =
              isDownloading && progress > 0 && progress < 1;
            const isLast = index === WHISPER_MODELS.length - 1;

            return (
              <View
                key={model.id}
                className="py-3 flex-row items-center"
                style={[
                  !isLast ? divider : null,
                  { opacity: isActive ? 1 : 0.55 },
                ]}
              >
                <View className="flex-1">
                  <Typography variant="h4" padding>
                    {model.label}
                  </Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    {isDownloaded
                      ? `Local · ${model.size}`
                      : `Cloud · ${model.size} download`}
                  </Typography>
                </View>

                <View className="flex-row items-center gap-2">
                  {isDownloaded && !isActive && !isInitializing && (
                    <Button
                      onPress={() => onDelete(model.id)}
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
                    onPress={() => onInitialize(model.id)}
                    disabled={isDownloading || isInitializing || isActive}
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
                        {(progress * 100).toFixed(0)}%
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
