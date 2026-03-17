// utils/ai/chatWithOpenAI.ts
import { getOpenAI } from "./openaiClient";

const openai = getOpenAI();

type ChatResult =
  | { success: true; content: string }
  | { success: false; error: string };

type Props = {
  userPrompt: string;
  model?: string;
  systemPrompt?: string;
};

export async function chatWithOpenAI({
  model = "gpt-4",
  systemPrompt,
  userPrompt,
}: Props): Promise<ChatResult> {
  const defaultSystemPromt =
    "You are a helpful assistant for organizing voice notes.";

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt ?? defaultSystemPromt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      return { success: false, error: "Empty response from OpenAI." };
    }

    return { success: true, content };
  } catch (error: any) {
    console.error("Chat error:", error);
    return {
      success: false,
      error: error?.message ?? "Unknown error",
    };
  }
}
