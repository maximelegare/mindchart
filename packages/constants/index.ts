// Base routes without any prefix - single source of truth
const baseRoutes = {
  generateNote: "/generate-note",
  generateEmbeddings: "/generate-embeddings",
} as const;

// Client routes - with /openai prefix
export const ClientOpenAIRoutes = {
  generateNote: `/openai${baseRoutes.generateNote}`,
  generateEmbeddings: `/openai${baseRoutes.generateEmbeddings}`,
} as const;

// Server routes - use base routes directly
export const ServerOpenAIRoutes = baseRoutes;

export const AIProviders = {
  local: "local",
  cloud: "cloud",
} as const;

export type AIProvider = (typeof AIProviders)[keyof typeof AIProviders];

export { generateNotesQ } from "./ai_queries/generateNotes";
