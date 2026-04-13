"use client";

import { SettingsCoreScene } from "@/components/3d/settings-core-scene";
import { useIsMobile } from "@/lib/hooks/use-mobile";

export default function SettingsPage() {
  const isMobile = useIsMobile();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl">Settings Core</h1>
        <p className="mt-2 text-zinc-300">Configure multi-store behavior, immersive notification physics, and control surfaces.</p>
      </header>

      {isMobile ? (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="echo-glass p-6">
            <p className="text-sm text-zinc-400">Theme Dynamics</p>
            <p className="mt-3 text-xl font-semibold">Adaptive Dark/Light (400ms spring)</p>
          </article>
          <article className="echo-glass p-6">
            <p className="text-sm text-zinc-400">Voice Input</p>
            <p className="mt-3 text-xl font-semibold">Enabled</p>
          </article>
        </div>
      ) : (
        <SettingsCoreScene />
      )}
    </section>
  );
}
