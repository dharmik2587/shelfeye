"use client";

import { motion } from "framer-motion";

export function OrbLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        className="h-14 w-14 rounded-full bg-indigo-500/30"
        initial={{ scale: 0.85, opacity: 0.8 }}
        animate={{ scale: [0.85, 1.05, 0.85], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <div className="h-full w-full rounded-full bg-indigo-400/50 blur-2xl" />
      </motion.div>
    </div>
  );
}
