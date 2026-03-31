import { Note, Thought, Topic } from "@repo/zod-schemas";
import { seedFormatNote } from "./utils/seedFormatNote";
import { useGenerateLocalEmbeddingsService } from "../features/embeddings/services/useGenerateLocalEmbeddingService";
import { getOPDatabase, seedDatabaseQuery } from "@repo/sqlite";
import { ServiceResponse } from "@/api/utils/responseObject";
import seedNotes from "./data/mock.json" with { type: "json" };
import seedTopics from "./data/mock_topics.json" with { type: "json" };
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";

const useSeedDatabaseService = () => {
  const db = getOPDatabase();
  const { generateEmbeddings } = useGenerateLocalEmbeddingsService();
  const { embed } = useLlamaEmbeddings();

  const seedDatabaseService = async (numberOfNotes: number) => {
    // const fakeData = generateGraphNotes(numberOfNotes);
    if (numberOfNotes > seedNotes.length) {
      return ServiceResponse.failure(
        `Enter a number less than or equal to ${seedNotes.length}`,
        null
      );
    }

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

      const topics: Topic[] = [];

      for (const topic of seedTopics) {
        const vector = await embed(topic.name, "clustering");

        const floatArray =
          vector instanceof Float32Array
            ? vector.slice()
            : new Float32Array(vector);
        topics.push({
          id: topic.id,
          name: topic.name,
          embedding: floatArray.buffer as unknown as Topic["embedding"],
          createdAt: new Date().toISOString(),
        });
      }

      await seedDatabaseQuery(db, {
        notes: formatedStructuredData.notes,
        thoughts: formatedStructuredData.thoughts,
        embeddings,
        topics,
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
