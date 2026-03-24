export interface WhisperModel {
  id: string;
  label: string;
  url: string;
  filename: string;
  capabilities: { multilingual: boolean; quantizable: boolean; tdrz?: boolean };
  size: string;
}
