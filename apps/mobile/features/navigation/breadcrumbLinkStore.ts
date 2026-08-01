import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BreadcrumbLinkStore = {
  /** When true, notes folder breadcrumbs and graph breadcrumbs stay in sync. */
  linkBreadcrumbs: boolean;
  setLinkBreadcrumbs: (linked: boolean) => void;
  toggleLinkBreadcrumbs: () => void;
};

export const useBreadcrumbLinkStore = create<BreadcrumbLinkStore>()(
  persist(
    (set) => ({
      linkBreadcrumbs: true,
      setLinkBreadcrumbs: (linkBreadcrumbs) => set({ linkBreadcrumbs }),
      toggleLinkBreadcrumbs: () =>
        set((state) => ({ linkBreadcrumbs: !state.linkBreadcrumbs })),
    }),
    {
      ...mmkv("breadcrumb-link"),
      partialize: (state) => ({ linkBreadcrumbs: state.linkBreadcrumbs }),
    }
  )
);

export const areBreadcrumbsLinked = () =>
  useBreadcrumbLinkStore.getState().linkBreadcrumbs;
