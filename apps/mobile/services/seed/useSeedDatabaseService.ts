import { Note, Thought } from "@repo/zod-schemas";
import { formatNote } from "../generateNote/utils/formatNote";
import { useGenerateLocalEmbeddingsService } from "../useGenerateLocalEmbeddingService";
import { generateGraphNotes } from "./utils/generateFakeData";
import { getOPDatabase, seedDatabaseQuery } from "@repo/sqlite";
import { ServiceResponse } from "@/api/utils/responseObject";

const useSeedDatabaseService = () => {
  const db = getOPDatabase();
  const { generateEmbeddings } = useGenerateLocalEmbeddingsService();
  const seedDatabaseService = async () => {
    const fakeData = generateGraphNotes(100);

    const formatedNotes = fakeData.map((note) => formatNote(note));
    const formatedStructuredData = formatedNotes.reduce(
      (acc, { note, thoughts }) => {
        acc.notes.push(note);
        acc.thoughts.push(...thoughts);
        return acc;
      },
      { notes: [] as Note[], thoughts: [] as Thought[] }
    );

    try {
      const embeddingsByNote: Awaited<ReturnType<typeof generateEmbeddings>>[] =
        [];
      for (const { thoughts } of formatedNotes) {
        embeddingsByNote.push(await generateEmbeddings(thoughts));
      }
      const embeddings = embeddingsByNote.flat();

      await seedDatabaseQuery(db, {
        notes: formatedStructuredData.notes,
        thoughts: formatedStructuredData.thoughts,
        embeddings,
      });

      return ServiceResponse.success("Database seeded successfully", null);
    } catch (error) {
      console.error(error);
      return ServiceResponse.failure("Failed to seed database", error);
    }
  };
  return { seedDatabaseService };
};

export { useSeedDatabaseService };
