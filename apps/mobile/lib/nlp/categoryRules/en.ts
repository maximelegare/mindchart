import type { CategoryRule } from "../types";

export const CATEGORY_RULES_EN: CategoryRule[] = [
  {
    category: "question",
    weight: 4,
    keywords: ["should i", "how do", "how can", "do i", "can i", "question:"],
    patterns: [
      /\?$/,
      /^(what(?! if)|why|how|when|where|who|which|should|could|would|is|are|do(?! not)|does|did)\b/i,
      /^question\s*:/i,
    ],
  },
  {
    category: "action",
    weight: 3.4,
    keywords: [
      "i should",
      "i need to",
      "need to",
      "have to",
      "remember to",
      "don't forget",
      "todo",
      "to-do",
    ],
    patterns: [
      /\b(call|buy|fix|migrate|schedule|write|send|email|ship|finish|clean|pay|book|push|learn|avoid)\b/i,
      /\b(i should|i need to|i have to|let's|lets)\b/i,
      /^(stop|avoid|remember to|don't|dont)\b/i,
      /^action\s*:/i,
    ],
  },
  {
    category: "hypothesis",
    weight: 3.2,
    keywords: [
      "maybe",
      "perhaps",
      "might be",
      "could be",
      "i wonder",
      "hypothesis:",
    ],
    patterns: [
      /\b(maybe|perhaps|might|probably|possibly)\b/i,
      /\b(could be causing|might be causing)\b/i,
      /^hypothesis\s*:/i,
    ],
  },
  {
    category: "problem",
    weight: 3.1,
    keywords: [
      "problem",
      "issue",
      "bug",
      "broken",
      "stuck",
      "crash",
      "fails",
      "error",
      "too slow",
      "forever",
    ],
    patterns: [
      /\b(problem|issue|bug|crash|broken|stuck|failing|error|slow|blocked)\b/i,
      /\btakes me forever\b/i,
      /^problem\s*:/i,
    ],
  },
  {
    category: "idea",
    weight: 3.6,
    keywords: ["what if", "what if we", "idea", "we could", "let's try"],
    patterns: [
      /\b(what if(?: we)?|idea|we could|we should try)\b/i,
      /\b(switch(?:ing)? from|replace .+ with)\b/i,
      /^idea\s*:/i,
    ],
  },
  {
    category: "observation",
    weight: 2.6,
    keywords: [
      "i've noticed",
      "i noticed",
      "i keep",
      "whenever",
      "i always",
      "i tend",
    ],
    patterns: [
      /\b(noticed|i keep|whenever|i always|i tend to|i've been)\b/i,
      /^observation\s*:/i,
    ],
  },
  {
    category: "fact",
    weight: 2.2,
    keywords: ["is faster", "is slower", "always", "never", "is a"],
    patterns: [
      /\b(is faster|is slower|always|never|equals|means that)\b/i,
      /^fact\s*:/i,
    ],
  },
  {
    category: "item",
    weight: 2.4,
    keywords: ["buy", "pack", "bring", "grocery", "list"],
    patterns: [/\b(buy|pack|bring|grocery|shopping)\b/i, /^item\s*:/i],
  },
];
