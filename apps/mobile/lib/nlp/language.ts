import type { NlpLanguage } from "./types";

const FR_MARKERS =
  /\b(je|j'|tu|nous|vous|ils|elles|le|la|les|des|une|est-ce|pourquoi|comment|peut-être|peux|dois|faut|avec|dans|pour|sur|très|aussi|mais|donc|alors|ça|cette|ces)\b/gi;
const EN_MARKERS =
  /\b(the|and|that|this|with|from|have|has|was|were|should|would|could|maybe|i've|i'm|it's|don't)\b/gi;
const FR_CHARS = /[àâçéèêëîïôùûüœæ]/i;

export const detectLanguage = (text: string): NlpLanguage => {
  const sample = text.trim();
  if (!sample) return "en";
  if (FR_CHARS.test(sample)) return "fr";
  const fr = sample.match(FR_MARKERS)?.length ?? 0;
  const en = sample.match(EN_MARKERS)?.length ?? 0;
  if (fr > en + 1) return "fr";
  return "en";
};
