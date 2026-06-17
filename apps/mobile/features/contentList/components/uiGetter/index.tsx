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
  const display = useOptionsBar((state) => state.display);

  const deferredGroupBy = useDeferredValue(groupBy);
  const deferredDisplay = useDeferredValue(display);

  const uiKey = useMemo(
    () => getUiKey(deferredGroupBy, deferredDisplay),
    [deferredGroupBy, deferredDisplay]
  );

  const ViewComponent = useMemo(() => resolveContentView(uiKey), [uiKey]);

  return <ViewComponent />;
});
