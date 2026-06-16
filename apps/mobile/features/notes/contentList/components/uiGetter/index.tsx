import { memo, useMemo } from "react";
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

  const uiKey = useMemo(() => getUiKey(groupBy, display), [groupBy, display]);

  const ViewComponent = useMemo(() => resolveContentView(uiKey), [uiKey]);

  return <ViewComponent />;
});
