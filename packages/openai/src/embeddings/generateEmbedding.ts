import { getOpenAI } from "../openaiClient";

const openai = getOpenAI();

export const generateEmbedding = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // or 'text-embedding-3-large'
      input: text,
      dimensions: 512,
      encoding_format: "float", // 'float' is default; you can also use 'base64' if storing as binary
    });

    return response.data[0].embedding; // array of floats (length 1536)
  } catch (error) {
    console.error(error);
  }
};
