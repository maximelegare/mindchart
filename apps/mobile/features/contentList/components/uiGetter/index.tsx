import { memo, useDeferredValue, useMemo } from "react";
import { useOptionsBar } from "../optionsBar/context/optionBarContext";
import { resolveContentView } from "./contentViewRegistry";
import { getUiKey } from "./getUiKey";
import { FolderContentsEmptyView } from "../../features/folderContents/views/empty";

export { getDisplayKey, getUiKey } from "./getUiKey";
export {
  CONTENT_VIEW_REGISTRY,
  resolveContentView,
  resolveContentViewFromOptions,
  type RegisteredUiKey,
} from "./contentViewRegistry";

export const UiGetter = memo(function UiGetter() {
  const groupBy = useOptionsBar((state) => state.groupBy);
  const displayMode = useOptionsBar((state) => state.displayMode);
  const currentFolderId = useOptionsBar((state) => state.currentFolderId);
  const foldersMode = useOptionsBar((state) => state.foldersMode);

  const deferredGroupBy = useDeferredValue(groupBy);
  const deferredDisplayMode = useDeferredValue(displayMode);
  const deferredFolderId = useDeferredValue(currentFolderId);
  const deferredFoldersMode = useDeferredValue(foldersMode);

  const uiKey = useMemo(
    () => getUiKey(deferredGroupBy, deferredDisplayMode),
    [deferredGroupBy, deferredDisplayMode]
  );

  const ViewComponent = useMemo(() => resolveContentView(uiKey), [uiKey]);

  if (deferredFoldersMode === "with" && deferredFolderId) {
    return <FolderContentsEmptyView />;
  }

  return <ViewComponent />;
});
