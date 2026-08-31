import { Folder, Note, Thought } from "@repo/zod-schemas";
import { seedFormatNote } from "./utils/seedFormatNote";
import { useGenerateLocalEmbeddingsService } from "../features/embeddings/services/useGenerateLocalEmbeddingService";
import { getOPDatabase, seedDatabaseQuery } from "@repo/sqlite";
import { ServiceResponse } from "@/api/utils/responseObject";
import seedNotes from "./data/mock.json" with { type: "json" };
import seedFolders from "./data/mock_folders.json" with { type: "json" };

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
      .map((note) => seedFormatNote(note))
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
