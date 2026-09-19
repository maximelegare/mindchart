import nlp from "compromise";
import {
  canonicalizeTerm,
  COMPROMISE_DOMAIN_WORDS,
  DOMAIN_TERMS,
} from "./domainLexicon";
import {
  GENERIC_WORDS,
  IMPORTANT_NOUNS,
  IMPORTANT_VERBS,
  scoreCandidate,
  SOFT_NOUNS,
  USEFUL_ADJECTIVES,
} from "./scoring";
import { isStopWord } from "./stopWords";
import type { LabelCandidate, NlpLanguage } from "./types";

nlp.extend({ words: COMPROMISE_DOMAIN_WORDS });

const MAX_WORDS = 7;
const MIN_SCORE = 3.4;
const CONTRACTION_FRAGMENTS = new Set([
  "ve",
  "re",
  "ll",
  "d",
  "t",
  "m",
  "s",
  "nt",
]);

const NOUN_FORMS: Record<string, string> = {
  interrupted: "interruptions",
  interrupt: "interruptions",
  interrupting: "interruptions",
  distracted: "distraction",
  distracting: "distraction",
  distrait: "distraction",
  distraite: "distraction",
  stuck: "stuck",
  coincé: "coincé",
};

const normalizeInput = (text: string): string =>
  text
    .replace(/\b(i|you|we|they|he|she)['’]ve\b/gi, "$1 have")
    .replace(/\bi['’]m\b/gi, "I am")
    .replace(/\b(you|we|they)['’]re\b/gi, "$1 are")
    .replace(/\b(i|you|we|they|he|she)['’]ll\b/gi, "$1 will")
    .replace(/\b(i|you|we|they|he|she)['’]d\b/gi, "$1 would")
    .replace(/\b(it|that|there|what|who|here)['’]s\b/gi, "$1 is")
    .replace(
      /\b(can|don|won|isn|aren|wasn|weren|haven|hasn|hadn|doesn|didn|shouldn|wouldn|couldn)['’]t\b/gi,
      "$1 not"
    )
    .replace(/\bj['’]/gi, "je ")
    .replace(/\bc['’]est\b/gi, "cela est")
    .replace(/\bn['’]/gi, "ne ")
    .replace(/\bqu['’]/gi, "que ")
    .replace(/\bd['’]/gi, "de ");

const wordCount = (value: string) => value.split(/\s+/).filter(Boolean).length;

const tokenize = (value: string): string[] =>
  value
    .replace(/[^\p{L}\p{N}\-+.]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

const trimEdgeNoise = (value: string, language: NlpLanguage): string => {
  const words = tokenize(value);
  const isNoise = (word: string) => {
    const lower = word.toLowerCase();
    return (
      CONTRACTION_FRAGMENTS.has(lower) ||
      isStopWord(lower, language) ||
      GENERIC_WORDS.has(lower)
    );
  };
  while (words.length && isNoise(words[0])) words.shift();
  while (words.length && isNoise(words[words.length - 1])) words.pop();
  return words.join(" ");
};

const cleanPhrase = (value: string, language: NlpLanguage): string => {
  const stripped = value
    .replace(/\s+/g, " ")
    .replace(/^[^A-Za-zÀ-ÿ0-9]+|[^A-Za-zÀ-ÿ0-9]+$/g, "")
    .trim();
  return trimEdgeNoise(stripped, language);
};

const isContentToken = (word: string, language: NlpLanguage): boolean => {
  const lower = word.toLowerCase();
  if (!lower) return false;
  if (DOMAIN_TERMS[lower]) return true;
  if (IMPORTANT_NOUNS.has(lower) || IMPORTANT_VERBS.has(lower)) return true;
  if (USEFUL_ADJECTIVES.has(lower)) return true;
  if (isStopWord(lower, language) || GENERIC_WORDS.has(lower)) return false;
  if (CONTRACTION_FRAGMENTS.has(lower)) return false;
  return /[A-ZÀ-Ÿ]/.test(word[0]) || lower.length >= 4;
};

const addCandidate = (
  bag: Map<string, LabelCandidate>,
  raw: string,
  source: string,
  language: NlpLanguage
) => {
  const cleaned = cleanPhrase(raw, language);
  if (!cleaned) return;
  const words = cleaned.split(/\s+/);
  if (words.length === 0 || words.length > MAX_WORDS) return;
  if (
    words.every(
      (word) =>
        isStopWord(word, language) || GENERIC_WORDS.has(word.toLowerCase())
    )
  ) {
    return;
  }
  if (words.some((word) => CONTRACTION_FRAGMENTS.has(word.toLowerCase())))
    return;

  const key = cleaned.toLowerCase();
  const score = scoreCandidate(cleaned, language);
  const previous = bag.get(key);
  if (!previous || score > previous.score) {
    bag.set(key, { text: cleaned, score, source });
  }
};

const matchTexts = (doc: ReturnType<typeof nlp>, pattern: string): string[] => {
  try {
    return doc
      .match(pattern)
      .out("array")
      .map((item: string) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

const namedEntityTexts = (doc: ReturnType<typeof nlp>): string[] => {
  const texts: string[] = [];
  for (const key of ["people", "places", "organizations"] as const) {
    const method = doc[key];
    if (typeof method !== "function") continue;
    try {
      texts.push(...((method.call(doc).out("array") as string[]) ?? []));
    } catch {
      // Named-entity helpers are English-oriented; skip if unavailable.
    }
  }
  return texts;
};

const addContentCombos = (
  bag: Map<string, LabelCandidate>,
  text: string,
  language: NlpLanguage
) => {
  const tokens = tokenize(text);
  const content = tokens.filter((token) => isContentToken(token, language));

  for (let i = 0; i < content.length - 1; i++) {
    addCandidate(
      bag,
      `${content[i]} ${content[i + 1]}`,
      "content-pair",
      language
    );
  }

  const domains = content.filter((token) => DOMAIN_TERMS[token.toLowerCase()]);
  const nouns = content.filter((token) =>
    IMPORTANT_NOUNS.has(token.toLowerCase())
  );
  for (const domain of domains) {
    for (const noun of nouns) {
      if (domain.toLowerCase() === noun.toLowerCase()) continue;
      addCandidate(bag, `${domain} ${noun}`, "domain-noun", language);
    }
  }

  const verbs = content.filter((token) =>
    IMPORTANT_VERBS.has(token.toLowerCase())
  );
  const objects = content.filter(
    (token) =>
      DOMAIN_TERMS[token.toLowerCase()] ||
      IMPORTANT_NOUNS.has(token.toLowerCase()) ||
      /[A-ZÀ-Ÿ]/.test(token[0])
  );
  for (const verb of verbs) {
    for (const object of objects) {
      if (verb.toLowerCase() === object.toLowerCase()) continue;
      addCandidate(bag, `${verb} ${object}`, "verb-object", language);
    }
  }

  for (let i = 0; i < tokens.length - 2; i++) {
    const [left, mid, right] = tokens.slice(i, i + 3);
    if (!left || !mid || !right) continue;
    if (!/^(while|when|whenever|pendant|quand)$/i.test(mid)) continue;
    const noun = NOUN_FORMS[left.toLowerCase()] ?? left;
    addCandidate(bag, `${right} ${noun}`, "while-clause", language);
  }
};

export const extractCandidates = (
  text: string,
  language: NlpLanguage
): LabelCandidate[] => {
  const bag = new Map<string, LabelCandidate>();
  const normalized = normalizeInput(text);
  const doc = nlp(normalized, COMPROMISE_DOMAIN_WORDS);

  const patterns = [
    "#Adjective+ #Noun+",
    "#Verb+ #Noun+",
    "#Verb #Adjective? #Noun+",
    "#Noun+ #Noun+",
    "#Noun+",
    "#ProperNoun+",
    "#Gerund #Noun+",
    "#Infinitive #Noun+",
    "stop #Gerund #Noun+",
    "arrêter? #Verb #Noun+",
  ];

  for (const pattern of patterns) {
    for (const phrase of matchTexts(doc, pattern)) {
      addCandidate(bag, phrase, pattern, language);
    }
  }

  for (const value of namedEntityTexts(doc)) {
    addCandidate(bag, value, "entity", language);
  }

  try {
    for (const value of (doc.nouns().out("array") as string[]) ?? []) {
      addCandidate(bag, value, "noun", language);
    }
    for (const value of (doc.verbs().out("array") as string[]) ?? []) {
      addCandidate(bag, value, "verb", language);
    }
    for (const value of (doc.clauses().out("array") as string[]) ?? []) {
      const clipped = cleanPhrase(value, language);
      if (wordCount(clipped) <= MAX_WORDS) {
        addCandidate(bag, clipped, "clause", language);
      }
    }
  } catch {
    // compromise helpers can throw on unusual punctuation; candidates still exist.
  }

  const tokens = tokenize(normalized);
  for (let i = 0; i < tokens.length; i++) {
    for (let size = 2; size <= 3; size++) {
      const slice = tokens.slice(i, i + size);
      if (slice.length < size) continue;
      addCandidate(bag, slice.join(" "), "ngram", language);
    }
  }

  addContentCombos(bag, normalized, language);

  return Array.from(bag.values()).sort((a, b) => b.score - a.score);
};

export const formatSemanticLabel = (phrase: string): string => {
  const words = phrase.split(/\s+/).filter(Boolean);
  return words
    .map((word, index) => {
      const canonical = canonicalizeTerm(word);
      if (canonical !== word) return canonical;
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
};

const rankCandidate = (candidate: LabelCandidate): number => {
  const words = candidate.text.split(/\s+/).filter(Boolean);
  const n = words.length;
  let rank = candidate.score;
  if (n >= 2 && n <= 4) rank += 2.2;
  else if (n === 1) rank -= 0.8;
  else if (n >= 6) rank -= 1.4;
  if (n === 2 && words.every((word) => SOFT_NOUNS.has(word.toLowerCase()))) {
    rank -= 3;
  }
  return rank;
};

export const pickSemanticLabel = (
  text: string,
  language: NlpLanguage
): {
  label: string | null;
  confidence: number;
  candidates: LabelCandidate[];
} => {
  const candidates = extractCandidates(text, language);
  const ranked = [...candidates].sort(
    (a, b) => rankCandidate(b) - rankCandidate(a)
  );
  const best = ranked[0];
  if (!best || best.score < MIN_SCORE) {
    return { label: null, confidence: 0, candidates };
  }

  const confidence = Math.min(1, best.score / 10);
  if (confidence < 0.34) {
    return { label: null, confidence, candidates };
  }

  return {
    label: formatSemanticLabel(best.text),
    confidence,
    candidates,
  };
};
