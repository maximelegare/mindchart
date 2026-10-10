import { useCallback } from "react";
import { useToastStore, type ToastInput } from "./toastStore";

export function useToast() {
  const show = useToastStore((state) => state.show);
  const dismiss = useToastStore((state) => state.dismiss);

  const toast = useCallback(
    (input: ToastInput | string) => show(input),
    [show]
  );

  return { toast, dismiss };
}
