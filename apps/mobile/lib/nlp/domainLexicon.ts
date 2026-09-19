export const DOMAIN_TERMS: Record<string, string> = {
  mindchart: "MindChart",
  react: "React",
  "react native": "React Native",
  expo: "Expo",
  sqlite: "SQLite",
  "op-sqlite": "op-sqlite",
  opsqlite: "op-sqlite",
  whisper: "Whisper",
  qwen: "Qwen",
  github: "GitHub",
  discord: "Discord",
  sqlcipher: "SQLCipher",
  llama: "Llama",
  fts5: "FTS5",
  nativewind: "NativeWind",
  drizzle: "Drizzle",
  typescript: "TypeScript",
  javascript: "JavaScript",
  metro: "Metro",
  skia: "Skia",
  mmkv: "MMKV",
  argon2: "Argon2",
};

/** compromise custom lexicon — keep domain terms as nouns. */
export const COMPROMISE_DOMAIN_WORDS: Record<string, string> =
  Object.fromEntries(Object.keys(DOMAIN_TERMS).map((term) => [term, "Noun"]));

export const canonicalizeTerm = (word: string): string => {
  const key = word.toLowerCase();
  return DOMAIN_TERMS[key] ?? word;
};
