import { jsonrepair } from "jsonrepair";

export const stringToJson = (input: string) => {
  try {
    if (!input) return null;

    // 1. Extract JSON block more safely
    const start = input.indexOf("{");
    const end = input.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in output");
    }

    const jsonString = input.slice(start, end + 1);

    // 2. Repair common LLM mistakes
    const repaired = jsonrepair(jsonString);

    // 3. Parse final result
    return JSON.parse(repaired);
  } catch (error) {
    console.error("JSON parse failed:", error);
    console.log("Raw input:", input);
    return null;
  }
};
