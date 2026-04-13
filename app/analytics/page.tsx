"use client";

import { AnalyticsFlowScene } from "@/components/3d/analytics-flow-scene";
import { useIsMobile } from "@/lib/hooks/use-mobile";

export default function AnalyticsPage() {
  const isMobile = useIsMobile();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl">Customer Analytics Flow</h1>
        <p className="mt-2 text-zinc-300">
          Dwell terrain, conversion ribbons, and immersive funnel intelligence in one spatial layer.
        </p>
      </header>

      {isMobile ? (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="echo-glass p-6">
            <p className="text-sm text-zinc-400">Dwell Hotspot</p>
            <p className="mt-3 text-2xl font-semibold">Aisle 4 +18%</p>
          </article>
          <article className="echo-glass p-6">
            <p className="text-sm text-zinc-400">Conversion Lift</p>
            <p className="mt-3 text-2xl font-semibold">+12.8%</p>
          </article>
        </div>
      ) : (
        <AnalyticsFlowScene />
      )}
    </section>
  );
}
