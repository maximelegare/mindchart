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
  { id: "ideas", name: "Ideas", color: "hsl(35.2, 89.7%, 81%)" },
  { id: "tasks", name: "Tasks", color: "hsl(53.8, 82.9%, 79.4%)" },
  { id: "events", name: "Events", color: "hsl(205.7, 55.3%, 85.1%)" },
  { id: "places", name: "Places", color: "hsl(23.8, 59.2%, 80.8%)" },
  { id: "goals", name: "Goals", color: "hsl(293.9, 95.2%, 83.7%)" },
  { id: "problems", name: "Problems", color: "hsl(0, 100%, 89%)" },
  { id: "insights", name: "Insights", color: "hsl(334, 89.8%, 88.4%)" },
  { id: "plans", name: "Plans", color: "hsl(109.6, 21.5%, 79%)" },
  { id: "questions", name: "Questions", color: "hsl(237.5, 90%, 84.3%)" },
  { id: "memories", name: "Memories", color: "hsl(318.8, 60%, 84.3%)" },
  { id: "learning", name: "Learning", color: "hsl(259.5, 71.4%, 89%)" },
  { id: "preferences", name: "Preferences", color: "hsl(177.5, 67.9%, 79.2%)" },
  { id: "projects", name: "Projects", color: "hsl(113.8, 45.9%, 71%)" },
  { id: "random", name: "Random", color: "hsl(310.9, 19.6%, 78%)" },
  { id: "uncategorized", name: "Uncategorized", color: "hsl(240, 21.5%, 79%)" },
  { id: "other", name: "Other", color: "hsl(0, 0%, 84.3%)" },
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
