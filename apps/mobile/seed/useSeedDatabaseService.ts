import { Folder, Note, Thought } from "@repo/zod-schemas";
import { seedFormatNote } from "./utils/seedFormatNote";
import { useGenerateLocalEmbeddingsService } from "../features/embeddings/services/useGenerateLocalEmbeddingService";
import { getOPDatabase, seedDatabaseQuery } from "@repo/sqlite";
import { ServiceResponse } from "@/api/utils/responseObject";
import { seedFolders, seedNotes } from "./parsedSeedData";

const useSeedDatabaseService = () => {
  const { generateEmbeddings } = useGenerateLocalEmbeddingsService();

  const seedDatabaseService = async (numberOfNotes: number) => {
    if (numberOfNotes > seedNotes.length) {
      throw new Error(
        `Enter a number less than or equal to ${seedNotes.length}`
      );
    }

    const db = getOPDatabase();
    const formatedNotes = seedNotes
      .slice(0, numberOfNotes)
      .map((note) => seedFormatNote(note));
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

      const folders: Folder[] = seedFolders.map((folder) => ({
        id: folder.id,
        path: folder.path,
        label: folder.label,
        createdAt: new Date().toISOString(),
      }));

      await seedDatabaseQuery(db, {
        notes: formatedStructuredData.notes,
        thoughts: formatedStructuredData.thoughts,
        embeddings,
        folders,
      });

      return ServiceResponse.success("Database seeded successfully", null);
    } catch (error) {
      console.error(error);
      throw error instanceof Error
        ? error
        : new Error("Failed to seed database");
    }
  };
  return { seedDatabaseService };
};

export { useSeedDatabaseService };
