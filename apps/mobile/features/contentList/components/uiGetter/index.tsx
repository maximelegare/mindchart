import { memo, useDeferredValue, useMemo } from "react";
import { useOptionsBar } from "../optionsBar/context/optionBarContext";
import { resolveContentView } from "./contentViewRegistry";
import { getUiKey } from "./getUiKey";

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
  const showOverview = useOptionsBar((state) => state.showOverview);

  const deferredGroupBy = useDeferredValue(groupBy);
  const deferredDisplayMode = useDeferredValue(displayMode);
  const deferredShowOverview = useDeferredValue(showOverview);

  const uiKey = useMemo(
    () => getUiKey(deferredGroupBy, deferredDisplayMode, deferredShowOverview),
    [deferredGroupBy, deferredDisplayMode, deferredShowOverview]
  );

  const ViewComponent = useMemo(() => resolveContentView(uiKey), [uiKey]);

  return <ViewComponent />;
});
