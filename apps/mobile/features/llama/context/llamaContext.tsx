import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import RNBlobUtil from "react-native-blob-util";
import { initLlama, type LlamaContext as NativeLlamaContext } from "llama.rn";
import { ModelDownloader } from "@/features/llama/utils/modelDownloader";
import { EMBEDDINGS_MODELS } from "@/features/llama/data/models/embeddings/embeddingsModels";
import { CHAT_MODELS } from "@/features/llama/data/models/chat/chatModels";
import { useModal } from "@/components/ui/modal/modal";

interface LlamaState {
  chatContext: NativeLlamaContext | null;
  embeddingContext: NativeLlamaContext | null;

  currentChatModelId: string | null;
  currentEmbeddingModelId: string | null;

  isDownloading: boolean;
  activeDownloadModelId: string | null;
  isInitializingChat: boolean;
  isInitializingEmbedding: boolean;

  downloadProgress: Record<string, number>;
  downloadedModels: Record<string, boolean>;
}

interface LlamaActions {
  initializeChatModel: (modelKey: string) => Promise<void>;
  initializeEmbeddingModel: (modelKey: string) => Promise<void>;

  releaseChat: () => Promise<void>;
  releaseEmbedding: () => Promise<void>;
  releaseAll: () => Promise<void>;

  checkLocalModels: () => Promise<void>;
  deleteModel: (modelKey: string) => Promise<void>;
}

const MODELS = { ...CHAT_MODELS, ...EMBEDDINGS_MODELS };

export const LlamaContextInstance = createContext<
  (LlamaState & LlamaActions) | null
>(null);

export const LlamaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<LlamaState>({
    chatContext: null,
    embeddingContext: null,

    currentChatModelId: null,
    currentEmbeddingModelId: null,

    isDownloading: false,
    activeDownloadModelId: null,
    isInitializingChat: false,
    isInitializingEmbedding: false,

    downloadProgress: {},
    downloadedModels: {},
  });

  const downloader = useMemo(() => new ModelDownloader(), []);
  const { openModal, closeModal } = useModal();

  // -----------------------------
  // Check local models
  // -----------------------------

  const checkLocalModels = useCallback(async () => {
    const results: Record<string, boolean> = {};
    const modelDir = `${RNBlobUtil.fs.dirs.DocumentDir}/models`;

    for (const [key, model] of Object.entries(MODELS)) {
      const mainExists = await RNBlobUtil.fs.exists(
        `${modelDir}/${model.filename}`
      );

      // Chat/embedding initialization in this provider uses only the main GGUF path.
      // Treat model availability based on main file presence to avoid false "Download"
      // states when optional multimodal projector files are absent.
      results[key] = mainExists;
    }

    setState((prev) => ({ ...prev, downloadedModels: results }));
  }, []);

  useEffect(() => {
    checkLocalModels();
  }, [checkLocalModels]);

  // -----------------------------
  // Release functions
  // -----------------------------

  const releaseChat = useCallback(async () => {
    if (state.chatContext) {
      await state.chatContext.release();
    }

    setState((prev) => ({
      ...prev,
      chatContext: null,
      currentChatModelId: null,
    }));
  }, [state.chatContext]);

  const releaseEmbedding = useCallback(async () => {
    if (state.embeddingContext) {
      await state.embeddingContext.release();
    }

    setState((prev) => ({
      ...prev,
      embeddingContext: null,
      currentEmbeddingModelId: null,
    }));
  }, [state.embeddingContext]);

  const releaseAll = useCallback(async () => {
    await releaseChat();
    await releaseEmbedding();
  }, [releaseChat, releaseEmbedding]);

  // -----------------------------
  // Initialize Embedding Model
  // -----------------------------

  const initializeEmbeddingModel = useCallback(
    async (modelKey: string) => {
      const config = MODELS[modelKey as keyof typeof MODELS];
      if (!config) return;

      try {
        setState((prev) => ({
          ...prev,
          isDownloading: true,
          activeDownloadModelId: modelKey,
        }));

        const modelPath = await downloader.downloadModel(
          config.repo,
          config.filename,
          (p) => {
            setState((prev) => ({
              ...prev,
              downloadProgress: {
                ...prev.downloadProgress,
                [modelKey]: p.percentage,
              },
            }));
          }
        );

        await checkLocalModels();

        setState((prev) => ({
          ...prev,
          isDownloading: false,
          activeDownloadModelId: null,
          isInitializingEmbedding: true,
        }));

        if (state.embeddingContext) {
          await state.embeddingContext.release();
        }

        const context = await initLlama({
          model: modelPath,
          embedding: true,
          n_ctx: 512, // small context is fine
          n_gpu_layers: 99,
          use_mlock: true,
        });

        setState((prev) => ({
          ...prev,
          embeddingContext: context,
          currentEmbeddingModelId: modelKey,
          isInitializingEmbedding: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isInitializingEmbedding: false,
          isDownloading: false,
          activeDownloadModelId: null,
        }));
        throw error;
      }
    },
    [state.embeddingContext, downloader, checkLocalModels]
  );

  // -----------------------------
  // Initialize Chat Model
  // -----------------------------

  const initializeChatModel = useCallback(
    async (modelKey: string) => {
      const config = MODELS[modelKey as keyof typeof MODELS];
      if (!config) return;

      try {
        setState((prev) => ({
          ...prev,
          isDownloading: true,
          activeDownloadModelId: modelKey,
        }));

        const modelPath = await downloader.downloadModel(
          config.repo,
          config.filename,
          (p) => {
            setState((prev) => ({
              ...prev,
              downloadProgress: {
                ...prev.downloadProgress,
                [modelKey]: p.percentage,
              },
            }));
          }
        );

        await checkLocalModels();

        setState((prev) => ({
          ...prev,
          isDownloading: false,
          activeDownloadModelId: null,
          isInitializingChat: true,
        }));

        if (state.chatContext) {
          await state.chatContext.release();
        }

        const context = await initLlama({
          model: modelPath,
          n_ctx: 2048,
          n_gpu_layers: 99,
          use_mlock: true,
        });

        setState((prev) => ({
          ...prev,
          chatContext: context,
          currentChatModelId: modelKey,
          isInitializingChat: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isInitializingChat: false,
          isDownloading: false,
          activeDownloadModelId: null,
        }));
        throw error;
      }
    },
    [state.chatContext, downloader, checkLocalModels]
  );

  // -----------------------------
  // Delete model
  // -----------------------------

  const deleteModel = useCallback(
    async (modelKey: string) => {
      const model = MODELS[modelKey as keyof typeof MODELS];
      if (!model) return;

      if (state.currentChatModelId === modelKey) await releaseChat();
      if (state.currentEmbeddingModelId === modelKey) await releaseEmbedding();

      const modelDir = `${RNBlobUtil.fs.dirs.DocumentDir}/models`;
      const files = [
        ...ModelDownloader.generateSplitFilenames(model.filename),
        ...(model.mmproj ? [model.mmproj] : []),
      ];

      try {
        await Promise.all(
          files.map(async (file) => {
            const path = `${modelDir}/${file}`;
            if (await RNBlobUtil.fs.exists(path)) {
              await RNBlobUtil.fs.unlink(path);
            }
          })
        );

        await checkLocalModels();
      } catch (error) {
        console.warn(error);
        openModal({
          modalName: "DELETE_MODEL_ERROR",
          onConfirm: () => closeModal(),
        });
      }
    },
    [
      state.currentChatModelId,
      state.currentEmbeddingModelId,
      releaseChat,
      releaseEmbedding,
      checkLocalModels,
    ]
  );

  const value = useMemo(
    () => ({
      ...state,
      initializeChatModel,
      initializeEmbeddingModel,
      releaseChat,
      releaseEmbedding,
      releaseAll,
      checkLocalModels,
      deleteModel,
    }),
    [
      state,
      initializeChatModel,
      initializeEmbeddingModel,
      releaseChat,
      releaseEmbedding,
      releaseAll,
      checkLocalModels,
      deleteModel,
    ]
  );

  return (
    <LlamaContextInstance.Provider value={value}>
      {children}
    </LlamaContextInstance.Provider>
  );
};
