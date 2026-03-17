import { getOpenAI } from "../openaiClient";

const openai = getOpenAI();

type TranscriptionResult =
  | { success: true; text: string }
  | { success: false; error: string };

export async function speachToText(file: File): Promise<TranscriptionResult> {
  try {
    const response = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    return {
      success: true,
      text: response.text,
    };
  } catch (error: any) {
    console.error("Transcription error:", error);
    return {
      success: false,
      error: error?.message ?? "Unknown error",
    };
  }
}
