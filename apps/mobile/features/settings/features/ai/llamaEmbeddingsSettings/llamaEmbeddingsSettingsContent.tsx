import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { hsl } from "@/utils/hsl";
import { Button } from "@/components/ui";
import { EMBEDDINGS_MODELS } from "@/features/llama/data/models/embeddings/embeddingsModels";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  settingsInsetStyle,
  settingsStatusStyle,
} from "@/features/settings/components/settingsSurfaces";

export type LlamaEmbeddingsSettingsContentProps = {
  currentModelId: string | null;
  isDownloading: boolean;
  activeDownloadModelId: string | null;
  isInitializingEmbedding: boolean;
  downloadProgress: Record<string, number>;
  downloadedModels: Record<string, unknown>;
  onInitialize: (modelKey: keyof typeof EMBEDDINGS_MODELS) => void;
  onRelease: () => void;
  onDelete: (modelKey: string) => void;
};

export function LlamaEmbeddingsSettingsContent({
  currentModelId,
  isDownloading,
  activeDownloadModelId,
  isInitializingEmbedding,
  downloadProgress,
  downloadedModels,
  onInitialize,
  onRelease,
  onDelete,
}: LlamaEmbeddingsSettingsContentProps) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="gap-4 py-2">
      <Typography padding>
        Local Embeddings Engine responsible for the creation of thoughts
        embeddings. It helps finding connections between notes.
      </Typography>

      <View>
        <Typography
          variant="h4"
          padding
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          Engine Status
        </Typography>
        <Card
          className="p-3 flex-row items-center"
          style={settingsStatusStyle(colorScheme)}
        >
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
          {isInitializingEmbedding ? (
            <ActivityIndicator color={hsl("foreground", colorScheme)} />
          ) : currentModelId ? (
            <Button onPress={onRelease} variant="destructive" size="sm">
              <Typography>Unload from RAM</Typography>
            </Button>
          ) : null}
        </Card>
      </View>

      <View>
        <Typography
          variant="h4"
          padding
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          Available Models
        </Typography>
        <View className="flex-col gap-3">
          {Object.entries(EMBEDDINGS_MODELS).map(([key, model]) => {
            const isDownloaded = !!downloadedModels[key];
            const isActive = currentModelId === key;
            const progress = downloadProgress[key] || 0;
            const downloadingThis =
              isDownloading && activeDownloadModelId === key;

            return (
              <Card
                key={key}
                className="p-3 flex-row items-center"
                style={settingsInsetStyle(colorScheme, isActive)}
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
                  {isDownloaded && !isActive && !isInitializingEmbedding && (
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
                    onPress={() =>
                      onInitialize(key as keyof typeof EMBEDDINGS_MODELS)
                    }
                    disabled={
                      isDownloading || isInitializingEmbedding || isActive
                    }
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
              </Card>
            );
          })}
        </View>
      </View>
    </View>
  );
}
