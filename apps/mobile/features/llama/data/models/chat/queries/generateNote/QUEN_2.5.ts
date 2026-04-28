export const QUEN_2_5_PROMPT = (
  input: string,
  options: { categories: string }
) => `
You must ONLY use information from the input text.
Do NOT use prior knowledge.
Do NOT add general facts.

Extract structured notes.

Return JSON:
{
  "title": "4-10 word title",
  "summary": "1-2 sentence summary",
  "topic": "2-4 word label",
  "thoughts": [
    {
      "title": "short bullet title",
      "summary": "1-2 sentence explanation",
      "category": "Category must be one of: ${options.categories}, or "other".",
      "semanticLabel": "2-4 word semantic label"
    }
  ]
}

Transcription:
${input}
`;
