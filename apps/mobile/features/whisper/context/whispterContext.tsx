// hooks/useWhisper.ts
import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import * as FileSystem from "expo-file-system/legacy"; // Use standard FileSystem
import { initWhisper, type WhisperContext } from "whisper.rn/index.js";

/* --- Constants --- */
import { WHISPER_MODELS } from "../data/whisperModels";

const MODEL_DIR = `${FileSystem.documentDirectory}whisper-models/`;

interface WhisperState {
  whisperContext: WhisperContext | null;
  currentModelId: string | null;
  isDownloading: boolean;
  isInitializing: boolean;
  downloadProgress: Record<string, number>;
  modelFiles: Record<string, boolean>;
}

interface WhisperActions {
  initializeModel: (modelId: string) => Promise<void>;
  releaseAll: () => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  checkDownloadedModels: () => Promise<void>;
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

  const checkDownloadedModels = useCallback(async () => {
    // 1. CRITICAL: Initialize the object with ALL keys as false immediately
    const results: Record<string, any> = {};
    WHISPER_MODELS.forEach((m) => {
      results[m.id] = false;
    });

    try {
      // 2. Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
      } else {
        // 3. Check each file
        for (const model of WHISPER_MODELS) {
          const fileUri = `${MODEL_DIR}${model.filename}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);

          if (fileInfo.exists) {
            results[model.id] = {
              path: fileUri,
              size: fileInfo.size || 0,
            };
          }
        }
      }
    } catch (error) {
      console.error("Whisper FS Scan Error:", error);
    }

    // This will now have all keys, even if they are all 'false'
    setState((prev) => ({ ...prev, modelFiles: results }));
  }, []);

  useEffect(() => {
    checkDownloadedModels();
  }, [checkDownloadedModels]);

  const releaseAll = useCallback(async () => {
    if (state.whisperContext) {
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

      if (state.currentModelId === modelId) await releaseAll();

      const fileUri = `${MODEL_DIR}${model.filename}`;
      const info = await FileSystem.getInfoAsync(fileUri);

      if (info.exists) {
        await FileSystem.deleteAsync(fileUri);
        setState((prev) => ({
          ...prev,
          modelFiles: { ...prev.modelFiles, [modelId]: false },
        }));
      }
    },
    [state.currentModelId, releaseAll]
  );

  const initializeModel = useCallback(
    async (modelId: string) => {
      const model = WHISPER_MODELS.find((m) => m.id === modelId);
      if (!model) throw new Error("Model not found");

      const fileUri = `${MODEL_DIR}${model.filename}`;
      const info = await FileSystem.getInfoAsync(fileUri);

      if (!info.exists) {
        setState((prev) => ({ ...prev, isDownloading: true }));
        try {
          const downloadResumable = FileSystem.createDownloadResumable(
            model.url,
            fileUri,
            {},
            (p) => {
              const progress =
                p.totalBytesWritten / p.totalBytesExpectedToWrite;
              setState((prev) => ({
                ...prev,
                downloadProgress: {
                  ...prev.downloadProgress,
                  [modelId]: progress,
                },
              }));
            }
          );
          await downloadResumable.downloadAsync();
        } finally {
          setState((prev) => ({ ...prev, isDownloading: false }));
        }
      }

      setState((prev) => ({ ...prev, isInitializing: true }));
      try {
        if (state.whisperContext) await state.whisperContext.release();

        const context = await initWhisper({ filePath: fileUri });
        const finalInfo = await FileSystem.getInfoAsync(fileUri);

        setState((prev) => ({
          ...prev,
          whisperContext: context,
          currentModelId: modelId,
          isInitializing: false,
          modelFiles: {
            ...prev.modelFiles,
            [modelId]: finalInfo.uri ? true : false,
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
    () => ({
      ...state,
      initializeModel,
      releaseAll,
      deleteModel,
      checkDownloadedModels,
    }),
    [state, initializeModel, releaseAll, deleteModel, checkDownloadedModels]
  );

  return (
    <WhisperContextInstance.Provider value={value}>
      {children}
    </WhisperContextInstance.Provider>
  );
};
