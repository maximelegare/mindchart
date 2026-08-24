import { fbs } from "fbtee";

export function SettingsAiSectionTitle() {
  return <fbt desc="Settings section: AI">AI</fbt>;
}

export function settingsAiAutoConnectLabel() {
  return fbs("Auto Connect", "Settings AI row: auto connect");
}

export function settingsAiAutoConnectDescription() {
  return fbs(
    "Connect Whisper and Llama Chat on launch. Embeddings always connect.",
    "Settings AI auto connect description"
  );
}

export function settingsAiAutoConnectAccessibilityLabel() {
  return fbs(
    "Auto Connect",
    "Settings AI auto connect switch accessibility label"
  );
}

export function settingsAiProvidersLabel() {
  return fbs("AI Providers", "Settings AI row: providers");
}

export function settingsAiWhisperEngineLabel() {
  return fbs("Whisper Engine", "Settings AI row: whisper engine");
}

export function settingsAiLlamaChatEngineLabel() {
  return fbs("Llama Chat Engine", "Settings AI row: llama chat engine");
}

export function settingsAiEmbeddingsEngineLabel() {
  return fbs("Embeddings Engine", "Settings AI row: embeddings engine");
}

export function settingsAiProviderLocal() {
  return fbs("Local", "AI provider option: local");
}

export function settingsAiProviderCloud() {
  return fbs("Cloud", "AI provider option: cloud");
}

export function settingsAiProviderMixed() {
  return fbs("Mixed", "AI providers summary: mixed");
}

export function settingsAiNoModel() {
  return fbs("No model", "AI settings: no model selected");
}

export function SettingsAiProvidersDescription() {
  return (
    <fbt desc="AI providers settings description">
      The AI providers are the locations where the AI models are hosted.
    </fbt>
  );
}

export function SettingsAiProviderWhisperLabel() {
  return <fbt desc="AI provider row: whisper">Whisper</fbt>;
}

export function SettingsAiProviderLlamaChatLabel() {
  return <fbt desc="AI provider row: llama chat">Llama Chat</fbt>;
}

export function SettingsAiProviderEmbeddingsLabel() {
  return <fbt desc="AI provider row: embeddings">Embeddings</fbt>;
}

export function SettingsWhisperEngineDescription() {
  return (
    <fbt desc="Whisper engine settings description">
      AI Engine responsible for the local transcription of speech. Use Tiny for
      English and Base for other languages.
    </fbt>
  );
}

export function SettingsLlamaChatEngineDescription() {
  return (
    <fbt desc="Llama chat engine settings description">
      Local Large Language Model responsible for the summarization of notes.
      Large models require more VRAM and storage but provide better accuracy.
    </fbt>
  );
}

export function SettingsEmbeddingsEngineDescription() {
  return (
    <fbt desc="Embeddings engine settings description">
      Local Embeddings Engine responsible for the creation of thoughts
      embeddings. It helps finding connections between notes.
    </fbt>
  );
}

export function SettingsAiEngineStatusHeading() {
  return <fbt desc="AI engine settings: status heading">Engine Status</fbt>;
}

export function SettingsAiActiveContextLabel() {
  return (
    <fbt desc="AI engine settings: active context label">Active Context</fbt>
  );
}

export function settingsAiIdleStatus() {
  return fbs("Idle", "AI engine status: idle");
}

export function SettingsAiAvailableModelsHeading() {
  return (
    <fbt desc="AI engine settings: available models heading">
      Available Models
    </fbt>
  );
}

export function settingsAiUnloadFromRam() {
  return fbs("Unload from RAM", "AI engine action: unload from RAM");
}

export function settingsAiModelDelete() {
  return fbs("Delete", "AI model action: delete");
}

export function settingsAiModelLoad() {
  return fbs("Load", "AI model action: load");
}

export function settingsAiModelLoaded() {
  return fbs("Loaded", "AI model action: loaded");
}

export function settingsAiModelDownload() {
  return fbs("Download", "AI model action: download");
}

export function settingsAiModelDownloading() {
  return fbs("Downloading...", "AI model action: downloading");
}

export function settingsAiModelLocalLabel(size: string) {
  return fbs(
    ["Local · ", fbs.param("size", size)],
    "AI model storage label: local"
  );
}

export function settingsAiModelCloudDownloadLabel(size: string) {
  return fbs(
    ["Cloud · ", fbs.param("size", size), " download"],
    "AI model storage label: cloud download"
  );
}

export function settingsAiConnectingTitle() {
  return fbs("Connecting to AI Models", "Auto connect loading title");
}

export function settingsAiGoToSettingsButton() {
  return fbs("Go to Settings", "AI setup modal: go to settings button");
}
