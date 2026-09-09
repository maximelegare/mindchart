export const FEELINGS_DEFINITIONS = [
  { value: 2, label: "Great", emoji: "😁" },
  { value: 1, label: "Good", emoji: "🙂" },
  { value: 0, label: "Neutral", emoji: "😐" },
  { value: -1, label: "Bad", emoji: "😞" },
  { value: -2, label: "Awful", emoji: "😠" },
] as const;

export type FeelingValue = (typeof FEELINGS_DEFINITIONS)[number]["value"];

export const SETTINGS_DEFINITIONS = [
  { id: "theme", name: "Theme", data: "system" },
] as const;

export const CATEGORIES_DEFINITIONS = [
  { id: "problem", name: "Problem", color: "hsl(0, 100%, 89%)" },
  { id: "insight", name: "Insight", color: "hsl(334, 89.8%, 88.4%)" },
  { id: "question", name: "Question", color: "hsl(237.5, 90%, 84.3%)" },
  { id: "memory", name: "Memory", color: "hsl(318.8, 60%, 84.3%)" },
  { id: "idea", name: "Idea", color: "hsl(35.2, 89.7%, 81%)" },
  { id: "uncategorized", name: "Uncategorized", color: "hsl(240, 21.5%, 79%)" },
] as const;

export const CATEGORIES_TRANSLATIONS: {
  lang: string;
  translations: Record<string, string>;
}[] = [
  {
    lang: "en-US",
    translations: {
      problem: "Problem",
      insight: "Insight",
      question: "Question",
      memory: "Memory",
      idea: "Idea",
      uncategorized: "Uncategorized",
    },
  },
  {
    lang: "fr-CA",
    translations: {
      problem: "Problème",
      insight: "Perspective",
      question: "Question",
      memory: "Souvenir",
      idea: "Idée",
      uncategorized: "Non classé",
    },
  },
];

export const APP_DATA_DEFINITIONS = [
  { id: "app_name", name: "app_name", data: "My App" },
  { id: "app_version", name: "app_version", data: "1.0.0" },
  { id: "setup_complete", name: "setup_complete", data: "true" },
  { id: "sync_graph", name: "sync_graph", data: "true" },
  { id: "graph_data", name: "graph_data", data: JSON.stringify({}) },
] as const;

export type SettingKey = (typeof SETTINGS_DEFINITIONS)[number]["id"];
export type CategoryKey = (typeof CATEGORIES_DEFINITIONS)[number]["id"];
export type AppDataKey = (typeof APP_DATA_DEFINITIONS)[number]["id"];
