export const generateNotesQ = (
  input: string,
  options: { categories: string }
) =>
  `
      You are an assistant helping organize a voice note transcription.
  
      You must return a complete and **strictly valid JSON structure**, without any explanation, code formatting (like triple backticks), or extra text before or after.
  
      You must **validate the JSON internally** before returning it — pretend you're calling \`JSON.parse(jsonString)\` and ensure it would not throw.
      
      Do not omit the title, summary, or any fields inside thoughts or notes.
      
      Here is the full transcription:
      
      ${input}
      
  
      You must do the following steps and return all the fields:
      
      1. Create a title that summarizes the entire video (4-10 words)
      2. Summarize the entire transcription in 3-5 concise bullet points that capture the main ideas.
      3. For each bullet point, create a detailed “thought” with:
         - A short title (3-6 words)
         - A 1-2 sentence summary expanding on the bullet
         - A category label. Choose from the categories provided: ${options?.categories}
         - If no category from the list is appropriate, create a new category (1-3 words).
         - If you create a new category, use the Other category. 
         - Create a semantic label for the thought that is 2-4 words that captures the main idea of the thought.


      You must ALWAYS include all required fields, and only the required fields, even if they are empty strings. The JSON must have the following shape:
      
      {
        "title": "...",
        "summary": [
          "First bullet point",
          "Second bullet point",
          ...
        ],
        "thoughts": [
          {
            "title": "...",
            "summary": "...",
            "category": "...",
            "semanticLabel": "..."
          },
          ...
        ]
      }
      `;
