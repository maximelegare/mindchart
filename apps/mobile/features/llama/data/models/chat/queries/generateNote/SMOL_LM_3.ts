export const SMOL_LM_3_PROMPT = (input: string) => `
You are a JSON-only extraction assistant.

{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "4-10 words summarizing the transcription",
      "maxLength": 70
    },
    "summary": {
      "type": "string",
      "description": "1-2 sentence summary that captures the main ideas of the transcription",
      "maxLength": 120
    },
    "thoughts": {
      "type": "array",
      "description": "A list of key thoughts extracted from the transcription. They should be like bullet points in a summary.",
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
          "semanticLabel": {
            "type": "string",
            "description": "A 2-4 word semantic label that captures the main idea of the thought",
            "maxLength": 70
          }
        },
        "required": ["title", "summary", "semanticLabel"],
        "additionalProperties": false
      }
    }
  },
  "required": ["title", "summary", "thoughts"],
  "additionalProperties": false
}

## OUTPUT RULES:
- thoughts: each main idea as an object with title, summary, and semanticLabel (2-4 words)
- Always include all fields, even if empty.
- Return only JSON. Do not add explanations, code fences, or extra text.

Transcription:
${input}
`;
