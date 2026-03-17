import { AppDataTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

export type NodeDatum = {
  id: string;
  name: string;
  value?: number;
  children?: Array<NodeDatum>;
  thoughtId?: string;
  title?: string;
  summary?: string;
  semanticLabel?: string;
  noteId?: string;
  categoryId?: string;
  createdAt?: string;
};

export type NodeType = {
  x: number;
  y: number;
  r: number;
  depth: number;
  name: string;
  children: boolean;
};

export const getGraphDataQuery = async (db: DB) => {
  try {
    const res = await db
      .select()
      .from(AppDataTable)
      .where(eq(AppDataTable.id, "graph_data"))
      .limit(1);

    if (!res[0]) return null;
    const item = res[0];
    const data = JSON.parse(item.data) as NodeDatum;

    // Keep all fields, but override `data`
    const result: Omit<typeof item, "data"> & { data: NodeDatum } = {
      ...item,
      data: data,
    };

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};
