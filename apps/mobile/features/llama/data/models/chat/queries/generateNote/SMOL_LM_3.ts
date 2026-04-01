export const SMOL_LM_3_PROMPT = (
  input: string,
  options: { categories: string }
) => `
You are an assistant that returns a single, valid JSON object with the structure of this JSON schema:

{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "The title of the note",
      "maxLength": 70
    },
    "summary": {
      "type": "string",
      "description": "1-2 sentence summary that captures the main ideas of the transcription",
      "maxLength": 120
    },
    "topic": {
      "type": "string",
      "description": "A 2-4 word semantic label that captures the main idea of the note",
      "maxLength": 20
    },
    "thoughts": {
      "type": "array",
      "description": "A list of key thoughts extracted from the transcription",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "A short title (3-6 words) that captures the main idea of the thought",
            "maxLength": 70
          },
          "summary": {
            "type": "string",
            "description": "A 1-2 sentence summary expanding on the bullet",
            "maxLength": 120
          },
          "category": {
            "type": "string",
            "description": "The category of the thought",
            "maxLength": 70
          },
          "semanticLabel": {
            "type": "string",
            "description": "A 2-4 word semantic label that captures the main idea of the thought",
            "maxLength": 70
          }
        },
        "required": ["title", "summary", "category", "semanticLabel"],
        "additionalProperties": false
      }
    }
  },
  "required": ["title", "summary", "topic", "thoughts"],
  "additionalProperties": false
}

Instructions:
- title: 4-10 words summarizing the transcription
- summary: 1-2 sentence summary capturing the main ideas
- topic: a 2-4 word semantic label that captures the main idea of the note
- thoughts: each main idea as an object with title, summary, category (lowercase), and semanticLabel (2-4 words)
- Use one of the categories provided: ${options?.categories}, or "other" if none apply
- Always include all fields, even if empty
- Return only JSON. Do not add explanations, code fences, or extra text.

Transcription:
${input}
`;
