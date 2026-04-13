"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  AudioLines,
  ChartNoAxesCombined,
  CheckSquare,
  Settings,
} from "lucide-react";

import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";
import { cn } from "@/lib/utils";

const sectors = [
  { id: "dashboard", label: "Pulse", icon: Activity, href: "/dashboard" },
  { id: "echo-canvas", label: "Canvas", icon: AudioLines, href: "/echo-canvas" },
  { id: "analytics", label: "Flow", icon: ChartNoAxesCombined, href: "/analytics" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "settings", label: "Core", icon: Settings, href: "/settings" },
] as const;

export function MobileOrbNav() {
  const pathname = usePathname();
  const router = useRouter();
  const setActiveSector = useEchoEngineStore((state) => state.setActiveSector);

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 lg:hidden">
      <nav className="grid w-full max-w-[520px] grid-cols-5 gap-2 rounded-3xl border border-indigo-400/25 bg-zinc-900/85 p-2 shadow-volumetric backdrop-blur-3xl">
        {sectors.map((sector) => {
          const Icon = sector.icon;
          const active = pathname === sector.href;

          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => {
                setActiveSector(sector.id);
                router.push(sector.href);
              }}
              className={cn(
                "relative rounded-3xl px-2 py-3 text-center text-[11px] font-medium text-zinc-300 transition",
                active ? "text-indigo-100" : "hover:bg-zinc-800/80",
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-orb-active"
                  className="absolute inset-0 rounded-3xl border border-indigo-400/35 bg-indigo-500/15"
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                />
              )}
              <span className="relative flex flex-col items-center gap-1">
                <Icon className="h-4 w-4" />
                {sector.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
