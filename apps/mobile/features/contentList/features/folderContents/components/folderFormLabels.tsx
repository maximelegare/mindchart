import { fbs } from "fbtee";

export type FolderFormMode = "create" | "rename";

export function FolderFormTitle({ mode }: { mode: FolderFormMode }) {
  if (mode === "create") {
    return <fbt desc="Folder form title: new folder">New folder</fbt>;
  }

  return <fbt desc="Folder form title: rename folder">Rename folder</fbt>;
}

export function folderBreadcrumbRootLabel() {
  return fbs("Root", "Breadcrumb label for root folder");
}

export function folderNestingLimitErrorMessage() {
  return fbs(
    "Folders can only be nested 3 levels deep.",
    "Error when folder nesting exceeds maximum depth"
  );
}
