import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { WHISPER_MODELS } from "@/features/whisper/data/whisperModels";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { hsl } from "@/utils/hsl";
import { Button } from "@/components/ui";
import { Gutter } from "@/components/ui/gutter";
import { useModal } from "@/components/ui/modal/modal";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  settingsInsetStyle,
  settingsStatusStyle,
} from "@/features/settings/components/settingsSurfaces";

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
  const { colorScheme } = useColorScheme();

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
      <Gutter size="none" className="py-3 mt-4">
        <View className="pb-4">
          <Typography padding>
            AI Engine responsible for the local transcription of speech. Use
            Tiny for English and Base for other languages.
          </Typography>
        </View>

        <View className="pb-4">
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
                {currentModelId ? currentModelId.toUpperCase() : "Idle"}
              </Typography>
            </View>
            {isInitializing ? (
              <ActivityIndicator color={hsl("foreground", colorScheme)} />
            ) : currentModelId ? (
              <Button onPress={releaseAll} variant="destructive" size="sm">
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
            {WHISPER_MODELS.map((model) => {
              const isDownloaded = !!modelFiles[model.id];
              const isActive = currentModelId === model.id;
              const progress = downloadProgress[model.id] || 0;
              const downloadingThis =
                isDownloading && progress > 0 && progress < 1;

              return (
                <Card
                  key={model.id}
                  className="p-3 flex-row items-center"
                  style={settingsInsetStyle(colorScheme, isActive)}
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
                        ? `Local · ${model.size}`
                        : `Cloud · ${model.size} download`}
                    </Typography>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {isDownloaded && !isActive && !isInitializing && (
                      <Button
                        onPress={() => handleDelete(model.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Typography
                          style={{
                            color: hsl("muted-foreground", colorScheme),
                          }}
                        >
                          Delete
                        </Typography>
                      </Button>
                    )}

                    <Button
                      onPress={() => handleModelAction(model.id)}
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
                </Card>
              );
            })}
          </View>
        </View>
      </Gutter>
    </>
  );
};
