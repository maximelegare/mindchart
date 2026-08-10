import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { hsl } from "@/utils/hsl";
import { Button } from "@/components/ui";
import { Gutter } from "@/components/ui/gutter";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { CHAT_MODELS } from "@/features/llama/data/models/chat/chatModels";
import { useModal } from "@/components/ui/modal/modal";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  settingsInsetStyle,
  settingsStatusStyle,
} from "@/features/settings/components/settingsSurfaces";

export const LlamaChatSettings = () => {
  const {
    currentModelId,
    isDownloading,
    activeDownloadModelId,
    isInitializingChat,
    downloadProgress,
    downloadedModels,
    initializeChatModel,
    releaseChat,
    deleteModel,
  } = useLlamaChat();

  const { openModal, closeModal } = useModal();
  const { colorScheme } = useColorScheme();

  const handleModelAction = async (modelKey: string) => {
    if (isDownloading || isInitializingChat) return;
    try {
      await initializeChatModel(modelKey);
    } catch (error) {
      console.error(error);
      openModal({
        modalName: "DELETE_MODEL_ERROR",
        onConfirm: () => {
          closeModal();
        },
      });
    }
  };

  const handleDelete = (modelKey: string) => {
    openModal({
      modalName: "DELETE_MODEL_ACTION",
      onConfirm: () => {
        deleteModel(modelKey);
        closeModal();
      },
      onCancel: () => {
        closeModal();
      },
    });
  };

  return (
    // <Card>
    <Gutter size="none" className="py-3 mt-4">
      {/* Header Section */}

      <Typography padding>
        Local Large Language Model responsible for the summarization of notes.
        Large models require more VRAM and storage but provide better accuracy.
      </Typography>

      {/* Engine Status Card */}
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
              {currentModelId ? currentModelId.replace(/_/g, " ") : "Idle"}
            </Typography>
          </View>
          {isInitializingChat ? (
            <ActivityIndicator color={hsl("foreground", colorScheme)} />
          ) : currentModelId ? (
            <Button onPress={releaseChat} variant="destructive" size="sm">
              <Typography>Unload from RAM</Typography>
            </Button>
          ) : null}
        </Card>
      </View>

      {/* Model List Section */}
      <View>
        <Typography
          variant="h4"
          padding
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          Available Models
        </Typography>
        <View className="flex-col gap-3">
          {Object.entries(CHAT_MODELS).map(([key, model]) => {
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
                  {isDownloaded && !isActive && !isInitializingChat && (
                    <Button
                      onPress={() => handleDelete(key)}
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
                    onPress={() => handleModelAction(key)}
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
              </Card>
            );
          })}
        </View>
      </View>
    </Gutter>
    // </Card>
  );
};
