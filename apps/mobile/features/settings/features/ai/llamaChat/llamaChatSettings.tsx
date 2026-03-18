import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { hsl } from "@/utils/hsl";
import { Button } from "@/components/ui";
import { Gutter } from "@/components/ui/gutter";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { CHAT_MODELS } from "@/features/llama/data/models/chat/chatModels";
import { useModal } from "@/components/ui/modal/modal";

export const LlamaChatSettings = () => {
  const {
    currentModelId,
    isDownloading,
    isInitializingChat,
    downloadProgress,
    downloadedModels,
    initializeChatModel,
    releaseAll,
    deleteModel,
  } = useLlamaChat();

  const { openModal, closeModal } = useModal();

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
    <Gutter size="md" className="py-3">
      {/* Header Section */}

      <Typography padding>
        Local Large Language Model responsible for the summarization of notes.
        Large models require more VRAM and storage but provide better accuracy.
      </Typography>

      {/* Engine Status Card */}
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
            <Typography className="text-muted-foreground text-sm" variant="h4">
              Active Context
            </Typography>
            <Typography variant="h3" padding>
              {currentModelId ? currentModelId.replace(/_/g, " ") : "Idle"}
            </Typography>
          </View>
          {isInitializingChat ? (
            <ActivityIndicator color={hsl("primary", "light")} />
          ) : currentModelId ? (
            <Button onPress={releaseAll} variant="destructive">
              <Typography>Unload from RAM</Typography>
            </Button>
          ) : null}
        </Card>
      </View>

      {/* Model List Section */}
      <View>
        <Typography variant="h4" className="text-muted-foreground" padding>
          Available Models
        </Typography>
        <View className="flex-col gap-4">
          {Object.entries(CHAT_MODELS).map(([key, model]) => {
            const isDownloaded = !!downloadedModels[key];
            const isActive = currentModelId === key;
            const progress = downloadProgress[key] || 0;
            const downloadingThis =
              isDownloading && progress > 0 && progress < 100;

            return (
              <Card
                key={key}
                className={cn(
                  "p-2 flex-row items-center bg-muted",
                  isActive && "border-primary"
                )}
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
                    <Button onPress={() => handleDelete(key)} variant="ghost">
                      <Typography className="text-destructive-foreground">
                        Delete
                      </Typography>
                    </Button>
                  )}

                  <Button
                    onPress={() => handleModelAction(key)}
                    disabled={isDownloading || isInitializingChat || isActive}
                  >
                    {downloadingThis ? (
                      <Typography>{progress.toFixed(0)}%</Typography>
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
    // </Card>
  );
};
