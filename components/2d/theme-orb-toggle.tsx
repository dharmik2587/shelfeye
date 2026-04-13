"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";

export function ThemeOrbToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative h-16 w-16 rounded-full border border-white/15 bg-zinc-900/70 p-2 shadow-volumetric backdrop-blur-3xl"
      aria-label="Toggle theme"
      type="button"
    >
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-400/30 via-sky-400/20 to-transparent"
        animate={{ rotate: isDark ? 360 : 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 110, damping: 18 }}
      />

      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
      >
        {isDark ? (
          <MoonStar className="h-5 w-5 text-indigo-200" />
        ) : (
          <Sun className="h-5 w-5 text-amber-300" />
        )}
      </motion.div>
    </button>
  );
}
