import { AIProvider } from "@repo/constants";

export type GenerateNoteService = {
  data: GenerateNoteServiceData;
  options?: GenerateNoteServiceOptions;
};

export type GenerateNoteServiceOptions = {
  providers?: {
    llm?: AIProvider;
    speechToText?: AIProvider;
    embeddings?: AIProvider;
  };
};

export type GenerateNoteServiceData = {
  audio?: {
    uri: string;
    name: string;
    type: string;
  };
  text?: string;
  categories: string;
};
