import type { CategoryRule, NlpLanguage } from "../types";
import { CATEGORY_RULES_EN } from "./en";
import { CATEGORY_RULES_FR } from "./fr";

export const categoryRulesFor = (language: NlpLanguage): CategoryRule[] =>
  language === "fr" ? CATEGORY_RULES_FR : CATEGORY_RULES_EN;
