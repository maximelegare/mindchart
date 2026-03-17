import { jsonrepair } from "jsonrepair";

export const stringToJson = (input: string) => {
  try {
    const regex = /(?:```(?:json)?\s*)?(\{[\s\S]*\})(?:\s*```)?/;
    const match = input.match(regex);

    if (match) {
      const jsonString = match[1];
      const repaired = jsonrepair(jsonString);
      return JSON.parse(repaired);
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};
