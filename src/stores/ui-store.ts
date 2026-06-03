import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  sidebarSectionsOpen: Record<string, boolean>;
  setSectionOpen: (title: string, open: boolean) => void;
  toggleSection: (title: string) => void;
  setSectionsOpen: (next: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarSectionsOpen: {},
      setSectionOpen: (title, open) =>
        set(() => {
          if (open) {
            return { sidebarSectionsOpen: { [title]: true } };
          }
          return { sidebarSectionsOpen: { [title]: false } };
        }),
      toggleSection: (title) =>
        set((s) => {
          if (s.sidebarSectionsOpen[title]) {
            return { sidebarSectionsOpen: { [title]: false } };
          }
          return { sidebarSectionsOpen: { [title]: true } };
        }),
      setSectionsOpen: (next) =>
        set((s) => ({
          sidebarSectionsOpen: typeof next === "function" ? next(s.sidebarSectionsOpen) : next,
        })),
    }),
    { name: "erp-ui" }
  )
);
