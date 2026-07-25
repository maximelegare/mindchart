import { getParentFolderPath } from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";
import { mapThoughtToLeaf } from "./mapThoughtToLeaf";

const folderNodeId = (folderId: string) => `folder-${folderId}`;

type MutableFolderNode = NodeDatum & { children: NodeDatum[] };

export function buildGraphByFolder(
  folders: Folder[],
  thoughts: ThoughtWithEmbedding[]
): NodeDatum {
  const folderNodes = new Map<string, MutableFolderNode>();

  for (const folder of folders) {
    folderNodes.set(folder.id, {
      id: folderNodeId(folder.id),
      name: folder.label || "Untitled",
      folderId: folder.id,
      folderPath: folder.path,
      folderLabel: folder.label,
      children: [],
    });
  }

  const rootChildren: NodeDatum[] = [];

  for (const folder of folders) {
    const node = folderNodes.get(folder.id)!;
    const parentPath = getParentFolderPath(folder.path);
    if (!parentPath) {
      rootChildren.push(node);
      continue;
    }
    const parentId = parentPath.split("/").filter(Boolean).pop();
    const parent = parentId ? folderNodes.get(parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      rootChildren.push(node);
    }
  }

  const unfiled: NodeDatum[] = [];

  for (const thought of thoughts) {
    const leaf = mapThoughtToLeaf(thought);
    if (thought.folderId && folderNodes.has(thought.folderId)) {
      folderNodes.get(thought.folderId)!.children.push(leaf);
    } else {
      unfiled.push(leaf);
    }
  }

  if (unfiled.length > 0) {
    rootChildren.push({
      id: "folder-unfiled",
      name: "No folder",
      folderId: "unfiled",
      children: unfiled,
    });
  }

  // Drop empty folder branches (no thoughts in subtree).
  const pruneEmpty = (node: NodeDatum): NodeDatum | null => {
    if (node.thoughtId) return node;
    const kids = (node.children ?? [])
      .map(pruneEmpty)
      .filter((child): child is NodeDatum => child != null);
    if (!kids.length) return null;
    return { ...node, children: kids };
  };

  const children = rootChildren
    .map(pruneEmpty)
    .filter((child): child is NodeDatum => child != null);

  return {
    id: "root",
    name: "root",
    children,
  };
}
