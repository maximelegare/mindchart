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
  { id: "idea", name: "Idea", color: "hsl(28, 92%, 76%)" },
  { id: "problem", name: "Problem", color: "hsl(4, 88%, 78%)" },
  { id: "question", name: "Question", color: "hsl(217, 82%, 78%)" },
  { id: "action", name: "Action", color: "hsl(328, 78%, 84%)" },
  { id: "fact", name: "Fact", color: "hsl(142, 48%, 74%)" },
  { id: "observation", name: "Observation", color: "hsl(268, 58%, 82%)" },
  { id: "hypothesis", name: "Hypothesis", color: "hsl(199, 62%, 84%)" },
  { id: "item", name: "Item", color: "hsl(48, 88%, 76%)" },
  { id: "uncategorized", name: "Uncategorized", color: "hsl(220, 8%, 80%)" },
] as const;

export const CATEGORIES_TRANSLATIONS: {
  lang: string;
  translations: Record<string, string>;
}[] = [
  {
    lang: "en-US",
    translations: {
      idea: "Idea",
      problem: "Problem",
      question: "Question",
      action: "Action",
      fact: "Fact",
      observation: "Observation",
      hypothesis: "Hypothesis",
      item: "Item",
      uncategorized: "Uncategorized",
    },
  },
  {
    lang: "fr-CA",
    translations: {
      idea: "Idée",
      problem: "Problème",
      question: "Question",
      action: "Action",
      fact: "Fait",
      observation: "Observation",
      hypothesis: "Hypothèse",
      item: "Élément",
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
