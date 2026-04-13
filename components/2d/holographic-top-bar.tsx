"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

export function HolographicTopBar() {
  const [query, setQuery] = useState("");
  const toggleChat = useEchoEngineStore((state) => state.toggleChat);
  const chatOpen = useEchoEngineStore((state) => state.chatOpen);
  const addMessage = useEchoEngineStore((state) => state.addMessage);

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${(i / 14) * 100}%`,
        delay: i * 0.09,
      })),
    [],
  );

  return (
    <motion.div
      className="relative hidden h-16 w-full max-w-[720px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/75 px-4 sm:px-6 lg:block"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 130, damping: 20 }}
    >
      <div className="flex h-full items-center gap-3">
        <Search className="h-4 w-4 text-indigo-300" />
        <input
          aria-label="Search ShelfForge"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask Echo anything about your store nervous system"
          className="h-full w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          onKeyDown={(event) => {
            if (event.key !== "Enter" || !query.trim()) {
              return;
            }

            const content = query.trim();
            addMessage({
              id: crypto.randomUUID(),
              role: "user",
              content,
              createdAt: new Date().toISOString(),
            });
            addMessage({
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Echo routed: "${content}" into the active intelligence context.`,
              createdAt: new Date().toISOString(),
            });
            if (!chatOpen) {
              toggleChat();
            }
            setQuery("");
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute top-1/2 h-1.5 w-1.5 rounded-full bg-indigo-400/80"
            style={{ left: particle.left }}
            animate={{
              y: [10, -10, 10],
              opacity: query ? [0.25, 0.95, 0.25] : [0.05, 0.4, 0.05],
            }}
            transition={{
              duration: 2.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
