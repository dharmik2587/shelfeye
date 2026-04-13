"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DashboardUiState {
  selectedShelfId: string | null;
  mapZoom: number;
  workerAssistantOpen: boolean;
  managerCopilotOpen: boolean;
  commandPaletteOpen: boolean;
  checkedInAt: number | null;
  setSelectedShelf: (id: string | null) => void;
  setMapZoom: (zoom: number) => void;
  toggleWorkerAssistant: (open?: boolean) => void;
  toggleManagerCopilot: (open?: boolean) => void;
  toggleCommandPalette: (open?: boolean) => void;
  setCheckedInAt: (value: number | null) => void;
}

export const useDashboardUiStore = create<DashboardUiState>()(
  persist(
    (set, get) => ({
      selectedShelfId: null,
      mapZoom: 1,
      workerAssistantOpen: false,
      managerCopilotOpen: true,
      commandPaletteOpen: false,
      checkedInAt: null,
      setSelectedShelf: (id) => set({ selectedShelfId: id }),
      setMapZoom: (zoom) => set({ mapZoom: Math.min(2.2, Math.max(0.7, zoom)) }),
      toggleWorkerAssistant: (open) => set({ workerAssistantOpen: open ?? !get().workerAssistantOpen }),
      toggleManagerCopilot: (open) => set({ managerCopilotOpen: open ?? !get().managerCopilotOpen }),
      toggleCommandPalette: (open) => set({ commandPaletteOpen: open ?? !get().commandPaletteOpen }),
      setCheckedInAt: (value) => set({ checkedInAt: value }),
    }),
    {
      name: "shelfeye-dashboard-ui-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedShelfId: state.selectedShelfId,
        mapZoom: state.mapZoom,
        checkedInAt: state.checkedInAt,
      }),
    },
  ),
);
