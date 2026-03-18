import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { WHISPER_MODELS } from "@/features/whisper/data/whisperModels";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { hsl } from "@/utils/hsl";
import { Button } from "@/components/ui";
import { Gutter } from "@/components/ui/gutter";
import { useModal } from "@/components/ui/modal/modal";

export const WhisperSettings = () => {
  const {
    currentModelId,
    isDownloading,
    isInitializing,
    downloadProgress,
    modelFiles,
    initializeModel,
    releaseAll,
    deleteModel, // Ensure this is exported from your hook
  } = useWhisper();

  const { openModal, closeModal } = useModal();
  const formatBytes = (bytes: number): string => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
  };

  const handleModelAction = async (modelId: string) => {
    if (isDownloading || isInitializing) return;
    try {
      await initializeModel(modelId);
    } catch (error) {
      console.error(error);
      openModal({
        modalName: "INITIALIZE_MODEL_ERROR",
        onConfirm: () => {
          closeModal();
        },
      });
    }
  };

  const handleDelete = (modelId: string) => {
    openModal({
      modalName: "DELETE_MODEL_ACTION",
      onConfirm: () => {
        deleteModel(modelId);
        closeModal();
      },
      onCancel: () => {
        closeModal();
      },
    });
  };

  return (
    <>
      <Gutter size="md" className="py-3">
        <View className="pb-4">
          <Typography padding>
            AI Engine responsible for the local transcription of speech. Use
            Tiny for English and Base for other languages.
          </Typography>
        </View>

        <View className="pb-4">
          <Typography className="text-muted-foreground" variant="h4" padding>
            Engine Status
          </Typography>
          <Card
            className={cn(
              "p-2 flex-row items-center bg-muted-foreground",
              !!currentModelId && "border-primary"
            )}
          >
            <View className="flex-1">
              <Typography
                className="text-muted-foreground text-sm"
                variant="h4"
              >
                Active Context
              </Typography>
              <Typography variant="h3" padding>
                {currentModelId ? currentModelId.toUpperCase() : "Idle"}
              </Typography>
            </View>
            {isInitializing ? (
              <ActivityIndicator color={hsl("primary", "light")} />
            ) : currentModelId ? (
              <Button onPress={releaseAll} variant="destructive">
                <Typography>Unload from RAM</Typography>
              </Button>
            ) : null}
          </Card>
        </View>

        <View>
          <Typography variant="h4" className="text-muted-foreground" padding>
            Available Models
          </Typography>
          <View className="flex-col gap-4">
            {WHISPER_MODELS.map((model) => {
              const isDownloaded = !!modelFiles[model.id];
              const isActive = currentModelId === model.id;
              const progress = downloadProgress[model.id] || 0;
              const downloadingThis =
                isDownloading && progress > 0 && progress < 1;

              return (
                <Card
                  key={model.id}
                  className={cn(
                    "p-2 flex-row items-center bg-muted",
                    isActive && "border-primary"
                  )}
                >
                  <View className="flex-1">
                    <Typography variant="h4" padding>
                      {model.label}
                    </Typography>
                    <Typography
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {isDownloaded
                        ? `Local · ${formatBytes(modelFiles[model.id].size)}`
                        : "Cloud · Download required"}
                    </Typography>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {isDownloaded && !isActive && !isInitializing && (
                      <Button
                        onPress={() => handleDelete(model.id)}
                        variant="ghost"
                      >
                        <Typography className="text-destructive-foreground">
                          Delete
                        </Typography>
                      </Button>
                    )}

                    <Button
                      onPress={() => handleModelAction(model.id)}
                      disabled={isDownloading || isInitializing || isActive}
                    >
                      {downloadingThis ? (
                        <Typography>{(progress * 100).toFixed(0)}%</Typography>
                      ) : (
                        <Typography>
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
      </Gutter>
    </>
  );
};
