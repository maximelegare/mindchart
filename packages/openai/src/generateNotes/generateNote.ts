import { chatWithOpenAI } from "../chatWithOpenAI";
import { generateNotesQ } from "@repo/constants";

export const generateNote = async (userInput: string) =>
  chatWithOpenAI({
    userPrompt: generateNotesQ(userInput),
  });
