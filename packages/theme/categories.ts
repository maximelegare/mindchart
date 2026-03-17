import { CategoryKey } from "../sqlite";

export const CATEGORIES_COLORS: Record<CategoryKey, string> = {
  ideas: "hsl(35.2, 89.7%, 81%)", //Orange
  feelings: "hsl(155, 67.9%, 79.2%)", // turquoise
  tasks: "hsl(53.8, 82.9%, 79.4%)", // Orange
  events: "hsl(205.7, 55.3%, 85.1%)",
  people: "hsl(29.3, 28.7%, 72%)",
  places: "hsl(23.8, 59.2%, 80.8%)", // Bourgogne
  goals: "hsl(293.9, 95.2%, 83.7%)", // violet
  problems: "hsl(0, 100%, 89%)", // rose, rouge
  insights: "hsl(334, 89.8%, 88.4%)",
  plans: "hsl(109.6, 21.5%, 79%)",
  questions: "hsl(237.5, 90%, 84.3%)",
  memories: "hsl(318.8, 60%, 84.3%)", // rose
  learning: "hsl(259.5, 71.4%, 89%)", // vert
  preferences: "hsl(177.5, 67.9%, 79.2%)",
  projects: "hsl(113.8, 45.9%, 71%)",
  random: "hsl(310.9, 19.6%, 78%)",
  uncategorized: "hsl(240, 21.5%, 79%)", // gris foncé
  other: "hsl(0, 0%, 84.3%)", // gris clair
};
