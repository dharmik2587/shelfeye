"use client";

import { motion } from "framer-motion";

import { useLanguageStore } from "@/lib/stores/language-store";

export function LanguageToggle() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <div className="relative inline-flex rounded-full border border-cyan-300/30 bg-slate-900/60 p-1">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="absolute inset-y-1 w-[76px] rounded-full bg-cyan-500/20"
        style={{ left: language === "en" ? 4 : 80 }}
      />
      <button
        onClick={() => setLanguage("en")}
        className={`relative z-10 rounded-full px-4 py-1 text-xs ${language === "en" ? "text-cyan-100" : "text-slate-300"}`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage("hi")}
        className={`relative z-10 rounded-full px-4 py-1 text-xs ${language === "hi" ? "text-cyan-100" : "text-slate-300"}`}
      >
        हिंदी
      </button>
    </div>
  );
}
