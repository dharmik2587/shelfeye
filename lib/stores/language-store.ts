"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Language = "en" | "hi";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "shelfeye-language-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
