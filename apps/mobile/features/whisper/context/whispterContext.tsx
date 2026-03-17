// hooks/useWhisper.ts
import React, { createContext, useState, useCallback, useMemo } from "react";
import { Directory, File, Paths } from "expo-file-system";
import { createDownloadResumable } from "expo-file-system/legacy";
import { initWhisper, type WhisperContext } from "whisper.rn/index.js";

/* --- Constants --- */
import { WHISPER_MODELS } from "../data/whisperModels";

interface WhisperState {
  whisperContext: WhisperContext | null;
  currentModelId: string | null;
  isDownloading: boolean;
  isInitializing: boolean;
  downloadProgress: Record<string, number>;
  modelFiles: Record<string, { path: string; size: number }>;
}

interface WhisperActions {
  initializeModel: (modelId: string) => Promise<void>;
  releaseAll: () => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
}

export const WhisperContextInstance = createContext<
  (WhisperState & WhisperActions) | null
>(null);

export const WhisperProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<WhisperState>({
    whisperContext: null,
    currentModelId: null,
    isDownloading: false,
    isInitializing: false,
    downloadProgress: {},
    modelFiles: {},
  });

  const getModelFile = (filename: string) => {
    const directory = new Directory(Paths.document, "whisper-models");
    directory.create({ idempotent: true });
    return new File(directory, filename);
  };

  const releaseAll = useCallback(async () => {
    if (state.whisperContext) {
      // CRITICAL: Call the native release method
      await state.whisperContext.release();
    }
    setState((prev) => ({
      ...prev,
      whisperContext: null,
      currentModelId: null,
    }));
  }, [state.whisperContext]);

  const deleteModel = useCallback(
    async (modelId: string) => {
      const model = WHISPER_MODELS.find((m) => m.id === modelId);
      if (!model) return;

      // If deleting the active model, unload it first
      if (state.currentModelId === modelId) {
        await releaseAll();
      }

      const file = getModelFile(model.filename);
      if (file.exists) {
        file.delete();
        setState((prev) => {
          const newFiles = { ...prev.modelFiles };
          delete newFiles[modelId];
          return { ...prev, modelFiles: newFiles };
        });
      }
    },
    [state.currentModelId, releaseAll]
  );

  const initializeModel = useCallback(
    async (modelId: string) => {
      const model = WHISPER_MODELS.find((m) => m.id === modelId);
      if (!model) throw new Error("Model not found");

      const file = getModelFile(model.filename);

      // 1. Download if missing
      if (!file.exists) {
        setState((prev) => ({ ...prev, isDownloading: true }));
        const resumable = createDownloadResumable(
          model.url,
          file.uri,
          {},
          (p) => {
            const progress = p.totalBytesWritten / p.totalBytesExpectedToWrite;
            setState((prev) => ({
              ...prev,
              downloadProgress: {
                ...prev.downloadProgress,
                [modelId]: progress,
              },
            }));
          }
        );
        await resumable.downloadAsync();
      }

      // 2. Load into Native Memory
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        isInitializing: true,
      }));
      try {
        if (state.whisperContext) await state.whisperContext.release();

        const context = await initWhisper({ filePath: file.uri });

        setState((prev) => ({
          ...prev,
          whisperContext: context,
          currentModelId: modelId,
          isInitializing: false,
          modelFiles: {
            ...prev.modelFiles,
            [modelId]: { path: file.uri, size: Number(file.info().size) },
          },
        }));
      } catch (e) {
        setState((prev) => ({ ...prev, isInitializing: false }));
        throw e;
      }
    },
    [state.whisperContext]
  );

  const value = useMemo(
    () => ({ ...state, initializeModel, releaseAll, deleteModel }),
    [state, initializeModel, releaseAll, deleteModel]
  );

  return (
    <WhisperContextInstance.Provider value={value}>
      {children}
    </WhisperContextInstance.Provider>
  );
};
