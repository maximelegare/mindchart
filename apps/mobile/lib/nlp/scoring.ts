import { DOMAIN_TERMS } from "./domainLexicon";
import { isStopWord } from "./stopWords";
import type { NlpLanguage } from "./types";

export const IMPORTANT_NOUNS = new Set([
  "database",
  "coding",
  "code",
  "programming",
  "programmation",
  "money",
  "relationship",
  "relationships",
  "project",
  "notification",
  "notifications",
  "performance",
  "migration",
  "interruptions",
  "distraction",
  "graph",
  "note",
  "thought",
  "folder",
  "category",
  "embedding",
  "model",
  "bug",
  "crash",
  "deadline",
  "meeting",
  "health",
  "sleep",
  "family",
  "mom",
  "dad",
  "work",
  "base",
  "données",
  "projet",
  "argent",
  "relation",
  "performance",
  "interruption",
  "distraction",
  "réunion",
  "santé",
  "sommeil",
  "famille",
  "maman",
  "papa",
  "travail",
]);

/** Common life nouns — useful in context, but weak as a two-word label on their own. */
export const SOFT_NOUNS = new Set([
  "work",
  "sleep",
  "family",
  "health",
  "travail",
  "sommeil",
  "famille",
  "santé",
]);

export const IMPORTANT_VERBS = new Set([
  "build",
  "fix",
  "change",
  "buy",
  "call",
  "learn",
  "avoid",
  "stop",
  "check",
  "checking",
  "switch",
  "switching",
  "migrate",
  "rewrite",
  "ship",
  "debug",
  "remember",
  "schedule",
  "write",
  "read",
  "open",
  "close",
  "delete",
  "move",
  "construire",
  "réparer",
  "changer",
  "acheter",
  "appeler",
  "apprendre",
  "éviter",
  "arrêter",
  "arrête",
  "vérifier",
  "vérifie",
  "migrer",
  "se souvenir",
  "écrire",
]);

export const USEFUL_ADJECTIVES = new Set([
  "expensive",
  "difficult",
  "useful",
  "important",
  "slow",
  "fast",
  "broken",
  "stuck",
  "urgent",
  "local",
  "offline",
  "cher",
  "difficile",
  "utile",
  "important",
  "lent",
  "rapide",
  "cassé",
  "coincé",
  "urgent",
]);

export const GENERIC_WORDS = new Set([
  "thing",
  "stuff",
  "make",
  "do",
  "get",
  "have",
  "be",
  "think",
  "feel",
  "really",
  "very",
  "just",
  "like",
  "maybe",
  "keep",
  "keeps",
  "keeping",
  "noticed",
  "notice",
  "seems",
  "looks",
  "something",
  "anything",
  "kind",
  "sort",
  "lot",
  "chose",
  "truc",
  "faire",
  "avoir",
  "être",
  "penser",
  "sentir",
  "vraiment",
  "très",
]);

const tokenize = (phrase: string): string[] =>
  phrase
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\-+.]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

export const scoreCandidate = (
  phrase: string,
  language: NlpLanguage
): number => {
  const words = tokenize(phrase);
  if (words.length === 0 || words.length > 7) return 0;

  let score = 0;
  let content = 0;

  for (const word of words) {
    if (DOMAIN_TERMS[word]) {
      score += 5;
      content += 1;
      continue;
    }
    if (isStopWord(word, language) || GENERIC_WORDS.has(word)) {
      score -= 1.5;
      continue;
    }
    if (IMPORTANT_NOUNS.has(word)) score += 2.4;
    else if (IMPORTANT_VERBS.has(word)) score += 2.1;
    else if (USEFUL_ADJECTIVES.has(word)) score += 1.4;
    else score += 1.1;
    content += 1;
  }

  if (content === 0) return 0;
  if (words.length >= 2 && content >= 2) score += 1.8;
  if (words.length === 1 && content === 1 && !DOMAIN_TERMS[words[0]]) {
    score -= 0.6;
  }
  if (words[0] && IMPORTANT_VERBS.has(words[0]) && content >= 2) score += 1.2;
  if (words.length === 2 && words.every((word) => SOFT_NOUNS.has(word))) {
    score -= 2.4;
  }
  if (words.some((word) => word.includes("-") && DOMAIN_TERMS[word])) {
    score += 0.8;
  }
  if (words.length >= 2 && words.every((word) => Boolean(DOMAIN_TERMS[word]))) {
    score -= 3;
  }

  return score;
};
