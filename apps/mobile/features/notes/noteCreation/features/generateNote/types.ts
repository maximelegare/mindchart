import { AIProviders } from "@/features/settings/features/ai/types/ai";

export type GenerateNoteService = {
  data: GenerateNoteServiceData;
  options?: GenerateNoteServiceOptions;
};

export type GenerateNoteServiceOptions = {
  providers?: AIProviders;
};

export type GenerateNoteServiceData = {
  audio?: {
    uri: string;
    name: string;
    type: string;
  };
  text?: string;
};
