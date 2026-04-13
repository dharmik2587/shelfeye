"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Command, LayoutDashboard, ShieldCheck, UserCircle2, X } from "lucide-react";

import { useDashboardUiStore } from "@/lib/stores/dashboard-ui-store";

interface CommandEntry {
  id: string;
  label: string;
  hint: string;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const open = useDashboardUiStore((state) => state.commandPaletteOpen);
  const toggleOpen = useDashboardUiStore((state) => state.toggleCommandPalette);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleOpen();
      }
      if (event.key === "Escape") {
        toggleOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleOpen]);

  const commands = useMemo<CommandEntry[]>(
    () => [
      { id: "worker", label: "Go to Worker Dashboard", hint: "/dashboard/worker", action: () => router.push("/dashboard/worker") },
      { id: "manager", label: "Go to Manager Dashboard", hint: "/dashboard/manager", action: () => router.push("/dashboard/manager") },
      { id: "auth", label: "Open Auth Screen", hint: "/auth", action: () => router.push("/auth") },
      { id: "landing", label: "Open Landing", hint: "/", action: () => router.push("/") },
    ],
    [router],
  );

  const filtered = commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.hint.includes(query.toLowerCase()));

  return (
    <>
      <button
        onClick={() => toggleOpen(true)}
        className="group fixed bottom-4 right-4 z-[85] hidden items-center gap-2 rounded-full border border-cyan-300/40 bg-slate-950/70 px-3 py-1.5 text-xs text-cyan-100 backdrop-blur-lg md:inline-flex"
      >
        <Command className="h-3.5 w-3.5" />
        Command Menu
        <span className="rounded border border-cyan-300/30 px-1 text-[10px] text-cyan-200 group-hover:border-cyan-200/70">⌘K</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-start justify-center bg-slate-950/65 px-4 py-20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-cyan-200/20 bg-slate-950/80 p-4 shadow-[0_24px_64px_-24px_rgba(0,245,255,0.45)] backdrop-blur-2xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-100">
                  <LayoutDashboard className="h-4 w-4 text-cyan-300" />
                  ShelfEye Command Palette
                </div>
                <button
                  onClick={() => toggleOpen(false)}
                  className="rounded-full border border-white/15 bg-white/5 p-1 text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a command..."
                className="w-full rounded-2xl border border-white/15 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none"
              />

              <div className="mt-3 space-y-2">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
                    No command found.
                  </div>
                ) : (
                  filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        toggleOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-left text-sm text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-500/10"
                    >
                      <span className="inline-flex items-center gap-2">
                        {item.id === "worker" ? <UserCircle2 className="h-4 w-4 text-cyan-300" /> : null}
                        {item.id === "manager" ? <ShieldCheck className="h-4 w-4 text-violet-300" /> : null}
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-400">{item.hint}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
