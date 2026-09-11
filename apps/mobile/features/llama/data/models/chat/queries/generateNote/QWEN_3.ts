export const QWEN_3_PROMPT = (input: string) => `
/no_think
You must ONLY use information from the input text.
Do NOT use prior knowledge.
Do NOT add general facts.

Turn the transcription into structured notes.

Coverage rules:
- Split every distinct idea, fact, event, decision, example, and detail into its own thought.
- Do NOT merge several ideas into one bullet.
- Do NOT omit details just to stay short.
- Prefer 4-12 thoughts when the input has enough content. One thought is only allowed if the input truly has a single idea.

Return JSON only:
{
  "title": "4-10 word title",
  "summary": "1-2 sentence summary",
  "thoughts": [
    {
      "title": "short bullet title",
      "summary": "1-2 sentence explanation using details from the input",
      "semanticLabel": "2-4 word semantic label"
    },
    {
      "title": "another distinct idea",
      "summary": "another 1-2 sentence explanation",
      "semanticLabel": "another label"
    }
  ]
}

Transcription:
${input}
`;
