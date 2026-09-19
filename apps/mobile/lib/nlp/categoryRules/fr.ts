import type { CategoryRule } from "../types";

export const CATEGORY_RULES_FR: CategoryRule[] = [
  {
    category: "question",
    weight: 4,
    keywords: ["est-ce", "dois-je", "est ce que", "question:"],
    patterns: [
      /\?$/,
      /^(est-ce|pourquoi|comment|quand|où|qui|quel|quelle|dois-je|puis-je|faut-il)\b/i,
      /^question\s*:/i,
    ],
  },
  {
    category: "action",
    weight: 3.4,
    keywords: ["je dois", "il faut", "je devrais", "n'oublie pas", "à faire"],
    patterns: [
      /\b(appeler|acheter|réparer|migrer|envoyer|finir|payer|réserver|arrêter|arrête|pousser)\b/i,
      /\b(je dois|je devrais|il faut|on devrait)\b/i,
      /^(arrête|arrêter|éviter)\b/i,
      /^action\s*:/i,
    ],
  },
  {
    category: "hypothesis",
    weight: 3.2,
    keywords: ["peut-être", "peut etre", "j'ai l'impression"],
    patterns: [
      /\b(peut-être|peut etre|probablement|possiblement)\b/i,
      /^hypoth[eè]se\s*:/i,
    ],
  },
  {
    category: "problem",
    weight: 3.1,
    keywords: [
      "problème",
      "bug",
      "cassé",
      "coincé",
      "erreur",
      "lent",
      "plante",
    ],
    patterns: [
      /\b(problème|probleme|bug|crash|cassé|coincé|erreur|lent|bloque)\b/i,
      /^probl[eè]me\s*:/i,
    ],
  },
  {
    category: "idea",
    weight: 3.6,
    keywords: ["idée", "et si", "et si on", "on pourrait", "plutôt que"],
    patterns: [
      /\b(idée|idee|et si(?: on)?|on pourrait|plutôt que|remplacer)\b/i,
      /^id[eé]e\s*:/i,
    ],
  },
  {
    category: "observation",
    weight: 2.6,
    keywords: ["j'ai remarqué", "je remarque", "chaque fois", "je tends"],
    patterns: [
      /\b(remarqué|remarque|chaque fois|j'ai tendance|je continue)\b/i,
      /^observation\s*:/i,
    ],
  },
  {
    category: "fact",
    weight: 2.2,
    keywords: ["est plus rapide", "est plus lent", "toujours", "jamais"],
    patterns: [
      /\b(est plus rapide|est plus lent|toujours|jamais)\b/i,
      /^fait\s*:/i,
    ],
  },
  {
    category: "item",
    weight: 2.4,
    keywords: ["acheter", "apporter", "liste"],
    patterns: [
      /\b(acheter|apporter|épicerie|liste)\b/i,
      /^(élément|element)\s*:/i,
    ],
  },
];
