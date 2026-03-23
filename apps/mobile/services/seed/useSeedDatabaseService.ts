import { Note, Thought } from "@repo/zod-schemas";
import { formatNote } from "../generateNote/utils/formatNote";
import { useGenerateLocalEmbeddingsService } from "../useGenerateLocalEmbeddingService";
import { getOPDatabase, seedDatabaseQuery } from "@repo/sqlite";
import { ServiceResponse } from "@/api/utils/responseObject";
import fakeData from "./data/mock.json" with { type: "json" };

const useSeedDatabaseService = () => {
  const db = getOPDatabase();
  const { generateEmbeddings } = useGenerateLocalEmbeddingsService();
  const seedDatabaseService = async (numberOfNotes: number) => {
    // const fakeData = generateGraphNotes(numberOfNotes);
    if (numberOfNotes > fakeData.length) {
      return ServiceResponse.failure(
        `Enter a number less than or equal to ${fakeData.length}`,
        null
      );
    }

    const formatedNotes = fakeData
      .map((note) => formatNote(note))
      .splice(0, numberOfNotes);
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
