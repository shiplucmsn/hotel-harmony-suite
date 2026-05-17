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
        set((s) => ({ sidebarSectionsOpen: { ...s.sidebarSectionsOpen, [title]: open } })),
      toggleSection: (title) =>
        set((s) => ({
          sidebarSectionsOpen: {
            ...s.sidebarSectionsOpen,
            [title]: !s.sidebarSectionsOpen[title],
          },
        })),
      setSectionsOpen: (next) =>
        set((s) => ({
          sidebarSectionsOpen: typeof next === "function" ? next(s.sidebarSectionsOpen) : next,
        })),
    }),
    { name: "erp-ui" }
  )
);
