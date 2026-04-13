"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EchoCanvasScene } from "@/components/3d/echo-canvas-scene";
import { TimelineRail3D } from "@/components/3d/timeline-rail-3d";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";
import { cn } from "@/lib/utils";

export default function EchoCanvasPage() {
  const isMobile = useIsMobile();
  const shelves = useEchoEngineStore((state) => state.shelves);
  const selectedShelfId = useEchoEngineStore((state) => state.selectedShelfId);
  const timeline = useEchoEngineStore((state) => state.timeline);
  const setTimeline = useEchoEngineStore((state) => state.setTimeline);
  const setSelectedShelf = useEchoEngineStore((state) => state.setSelectedShelf);
  const [draggingTimeline, setDraggingTimeline] = useState(false);

  const selectedShelf = shelves.find((shelf) => shelf.id === selectedShelfId);

  const ghostShelves = useMemo(
    () =>
      shelves.slice(0, 4).map((shelf) => ({
        id: shelf.id,
        projectedStock: Math.max(0, Math.round(shelf.stockLevel + (timeline - 50) * 0.22)),
      })),
    [shelves, timeline],
  );

  return (
    <section className={cn("relative space-y-6", selectedShelf && "2xl:pr-[352px]")}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Echo Canvas</h1>
          <p className="mt-2 text-zinc-300">Step inside the AI mind and manipulate the store as a living spatial system.</p>
        </div>
        <Button variant="outline" className="hidden md:flex" onClick={() => setSelectedShelf(undefined)}>
          Reset Focus
        </Button>
      </header>

      {isMobile ? (
        <div className="echo-glass p-6">
          Mobile mode uses a high-fidelity 2D projection. Open desktop for full volumetric canvas.
        </div>
      ) : (
        <EchoCanvasScene />
      )}

      <AnimatePresence>
        {selectedShelf && (
          <motion.aside
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 130, damping: 17 }}
            className="pointer-events-auto fixed right-8 top-32 z-40 h-[calc(100vh-220px)] w-[320px] overflow-y-auto rounded-3xl border border-indigo-400/30 bg-zinc-900/92 p-6 shadow-volumetric backdrop-blur-3xl"
          >
            <h2 className="text-xl">{selectedShelf.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">Aisle {selectedShelf.aisle}</p>

            <div className="mt-6 rounded-3xl border border-zinc-700 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Compliance Gauge</p>
              <div className="mt-3 h-20 w-20 rounded-full border-4 border-indigo-400/35 p-1">
                <div
                  className="h-full w-full rounded-full border-4 border-emerald-400"
                  style={{ clipPath: `inset(${100 - selectedShelf.stockLevel}% 0 0 0)` }}
                />
              </div>
              <p className="mt-2 text-sm text-zinc-300">{Math.round(selectedShelf.stockLevel)}% shelf health</p>
            </div>

            <div className="mt-6 space-y-3">
              <article className="rounded-3xl border border-zinc-700 bg-zinc-950/65 p-4">
                <p className="text-xs text-zinc-400">Revenue Pulse</p>
                <p className="text-lg font-semibold">${Math.round(selectedShelf.revenue).toLocaleString()}</p>
              </article>
              <article className="rounded-3xl border border-zinc-700 bg-zinc-950/65 p-4">
                <p className="text-xs text-zinc-400">Dwell Density</p>
                <p className="text-lg font-semibold">{Math.round(selectedShelf.dwell)} min/hr</p>
              </article>
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full justify-start gap-2">
                <Sparkles className="h-4 w-4" />
                Deploy AI Restock Action
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <ShieldCheck className="h-4 w-4" />
                Run Compliance Sweep
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Bot className="h-4 w-4" />
                Ask Echo for Forecast
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Timeline Warp</p>

        {isMobile ? (
          <input
            type="range"
            min={0}
            max={100}
            value={timeline}
            onChange={(event) => setTimeline(Number(event.target.value))}
            className="w-full"
          />
        ) : (
          <div
            onMouseDown={() => setDraggingTimeline(true)}
            onMouseUp={() => setDraggingTimeline(false)}
            onMouseLeave={() => setDraggingTimeline(false)}
          >
            <TimelineRail3D value={timeline} onChange={setTimeline} />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-zinc-300">
          <span>T-{Math.round((50 - timeline) / 5)}h</span>
          <span>T+{Math.round((timeline - 50) / 5)}h</span>
        </div>
      </div>

      {draggingTimeline && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-3xl border border-indigo-400/35 bg-zinc-900/85 p-4 backdrop-blur-3xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-indigo-200">
            <WandSparkles className="h-4 w-4" />
            Future ghost shelves materializing
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ghostShelves.map((ghost) => (
              <div key={ghost.id} className="rounded-3xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-xs text-zinc-300">
                {ghost.id}: {ghost.projectedStock}%
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
