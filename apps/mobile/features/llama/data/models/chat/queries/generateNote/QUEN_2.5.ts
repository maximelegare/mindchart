export const QUEN_2_5_PROMPT = (input: string) => `
You must ONLY use information from the input text.
Do NOT use prior knowledge.
Do NOT add general facts.

Extract structured notes.

Return JSON:
{
  "title": "4-10 word title",
  "summary": "1-2 sentence summary",
  "thoughts": [
    {
      "title": "short bullet title",
      "summary": "1-2 sentence explanation",
      "semanticLabel": "2-4 word semantic label"
    }
  ]
}

Transcription:
${input}
`;
