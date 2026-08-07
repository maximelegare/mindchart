export const DEFAULT_CATEGORIES_COLORS: Record<CategoryKey, string> = {
  ideas: "#000000",
  feelings: "#000000",
  tasks: "#000000",
  events: "#000000",
  places: "#000000",
  goals: "#000000",
  problems: "#000000",
  insights: "#000000",
  plans: "#000000",
  questions: "#000000",
  memories: "#000000",
  learning: "#000000",
  preferences: "#000000",
  projects: "#000000",
  random: "#000000",
  uncategorized: "#000000",
  other: "#000000",
} as const;

export const SETTINGS_DEFINITIONS = [
  { id: "theme", name: "Theme", data: "system" },
  {
    id: "graph_categories_colors",
    name: "Graph Categories Colors",
    data: JSON.stringify(DEFAULT_CATEGORIES_COLORS),
  },
] as const;

export const CATEGORIES_DEFINITIONS = [
  { id: "ideas", name: "Ideas" },
  { id: "feelings", name: "Feelings" },
  { id: "tasks", name: "Tasks" },
  { id: "events", name: "Events" },
  { id: "places", name: "Places" },
  { id: "goals", name: "Goals" },
  { id: "problems", name: "Problems" },
  { id: "insights", name: "Insights" },
  { id: "plans", name: "Plans" },
  { id: "questions", name: "Questions" },
  { id: "memories", name: "Memories" },
  { id: "learning", name: "Learning" },
  { id: "preferences", name: "Preferences" },
  { id: "projects", name: "Projects" },
  { id: "random", name: "Random" },
  { id: "uncategorized", name: "Uncategorized" },
  { id: "other", name: "Other" },
] as const;

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
