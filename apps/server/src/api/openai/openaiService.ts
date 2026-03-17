// import { OpenAIResNoteSchema, Note, Thought } from "@repo/zod-schemas/server";
// import { ServiceResponse } from "@/common/models/serviceResponse";
// import { generateEmbedding, generateNote, speachToText } from "@repo/openai";
// import { jsonrepair } from "jsonrepair";

// export const generateID = (): string => {
//   return (
//     Date.now().toString(36) +
//     Math.random().toString(36).slice(2, 12).padStart(12, "0")
//   );
// };

// type GenerateNoteServiceOptions = {
//   categories:string
// }

// export const openaiService = () => {
//   const generateNoteService = async (file: Express.Multer.File | undefined,options:GenerateNoteServiceOptions): Promise<
//     ServiceResponse<{  note: Note; thoughts: Thought[] } | null>
//   > => {

//     if (!file) return ServiceResponse.failure<null>("No file provided", null);

//     // Convert Express.Multer.File (buffer) to a File-like object for speachToText
//     const serverFile = new Blob([file.buffer as unknown as ArrayBuffer], { type: file.mimetype }) as unknown as File;
//     (serverFile as any).name = file.originalname;

//     const transcriptResult = await speachToText(serverFile);

//     if (!transcriptResult.success)
//       return ServiceResponse.failure<null>(
//         "Error while doing transcript",
//         null
//       );

//     // Generates a Note containing a summary and multiple thoughts
//     const generatedNote = await generateNote(transcriptResult.text, options.categories);

//     if (!generatedNote.success)
//       return ServiceResponse.failure<null>(
//         "Error while generating the note",
//         null
//       );

//     const repairedGeneratedNote = jsonrepair(generatedNote.content);
//     console.log("repairedGeneratedNote:", repairedGeneratedNote);

//     const transformedStringContentToObject = JSON.parse(repairedGeneratedNote);

//     const parsedNote = OpenAIResNoteSchema.parse(
//       transformedStringContentToObject
//     );

//     const noteId = generateID();

//     const formatedNote = {
//       id: noteId,
//       title: parsedNote.title,
//       summary: parsedNote.summary,
//       createdAt: new Date().toISOString(),
//     };

//     const formatedToughts = parsedNote.thoughts.map((t) => {
//       const recordId = generateID();
//       const categoryId = t.category ?? "uncategorized";
//       const thoughtId = t.thoughtId ?? recordId;

//       return {
//         ...t,
//         noteId,
//         id: recordId,
//         thoughtId,
//         categoryId,
//         createdAt: new Date().toISOString(),
//       };
//     });

//     const response = {  note: formatedNote, thoughts: formatedToughts };

//     return ServiceResponse.success<{ note: Note; thoughts: Thought[]; }>(
//       "Success generating the note & thoughts",
//       response
//     );
//   };

//   const generateEmbeddingService = async (text: string) => {
//     const embeddings = await generateEmbedding(text);
//     if (!embeddings) return ServiceResponse.failure<null>("Error while generating the embeddings", null);
//     return ServiceResponse.success<{ embeddings: number[] }>(
//       "Success generating the embeddings",
//       {embeddings}
//     );
//   };

//   // const generateEmbeddingsService = async (thoughts: Thought[]): Promise<ServiceResponse<{ embeddings: {id: string, embedding: number[] | undefined}[] }>> => {
//   //   const embeddings = await Promise.all(
//   //     thoughts.map(async (thought) => {
//   //       const embeddingRes = await generateEmbeddingService(thought.summary);
//   //       return {
//   //         id: thought.id, // or generateID() if you want unique ids
//   //         embedding: embeddingRes.responseObject?.embeddings
//   //       };
//   //     })
//   //   );

//   //   return ServiceResponse.success<{ embeddings: { id: string, embedding: number[] | undefined }[] }>(
//   //     "Success generating the embeddings",
//   //     { embeddings }
//   //   );
//   // }

//   const generateEmbeddingsService = async (thoughts: Thought[]): Promise<ServiceResponse<{ embeddings: Record<string, number[] | undefined> }>> => {
//     const embeddingRecords: Record<string, number[] | undefined> = {};
//     await Promise.all(
//       thoughts.map(async (thought) => {
//         if(!thought.summary) return;

//         const embedding = await generateEmbeddingService(thought.summary);
//         embeddingRecords[thought.id] = embedding.responseObject?.embeddings;
//       })
//     );

//     return ServiceResponse.success<{ embeddings: Record<string, number[] | undefined> }>(
//       "Success generating the embeddings",
//       { embeddings: embeddingRecords }
//     );
//   };

//   // const generateEmbeddingsService = async (thoughts: Thought[]): Promise<ServiceResponse<{ embeddings: { id: string; embedding: number[] | undefined }[] }>> => {
//   //   const embeddings = await Promise.all(thoughts.map(async (thought) => {
//   //     const embedding = await generateEmbeddingService(thought.summary);
//   //     return {id: thought.id, embedding: embedding.responseObject?.embeddings};
//   //   }));

//   //   return ServiceResponse.success<{ embeddings: { id: string; embedding: number[] | undefined }[] }>(
//   //     "Success generating the embeddings",
//   //     {embeddings}
//   //   );
//   // };

//   return {
//     generateNoteService,
//     generateEmbeddingsService
//   };
// };
