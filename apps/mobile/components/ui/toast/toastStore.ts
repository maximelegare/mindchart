import type { ReactNode } from "react";
import type { Href } from "expo-router";
import { create } from "zustand";

export type ToastInput = {
  title: ReactNode;
  description?: ReactNode;
  duration?: number;
  variant?: "default" | "error";
  label?: ReactNode;
  link?: Href;
};

export type ToastItem = ToastInput & { id: string };

type ToastStore = {
  toasts: ToastItem[];
  show: (input: ToastInput | string) => string;
  dismiss: (id?: string) => void;
};

const DEFAULT_DURATION_MS = 3200;
const DEFAULT_DURATION_WITH_LINK_MS = 5000;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (input) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next: ToastItem =
      typeof input === "string"
        ? { id, title: input, duration: DEFAULT_DURATION_MS }
        : {
            id,
            title: input.title,
            description: input.description,
            variant: input.variant,
            label: input.label,
            link: input.link,
            duration:
              input.duration ??
              (input.link
                ? DEFAULT_DURATION_WITH_LINK_MS
                : DEFAULT_DURATION_MS),
          };
    set((state) => ({ toasts: [...state.toasts, next] }));
    return id;
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: id
        ? state.toasts.filter((toast) => toast.id !== id)
        : state.toasts.slice(0, -1),
    }));
  },
}));

export const toast = (input: ToastInput | string) =>
  useToastStore.getState().show(input);
