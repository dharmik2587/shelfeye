"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crosshair, LocateFixed, Search, ZoomIn, ZoomOut } from "lucide-react";

import type { ShelfZone } from "@/lib/data/shelfeye-dashboard-data";
import type { Language } from "@/lib/stores/language-store";

interface WorkerStoreMapProps {
  zones: ShelfZone[];
  selectedId: string | null;
  zoom: number;
  language: Language;
  onSelect: (id: string) => void;
  onZoom: (value: number) => void;
}

const labels = {
  en: {
    title: "2D Interactive Store Map",
    subtitle: "Crisp vector floorplan with live shelf intelligence",
    search: "Search shelf (e.g. 2A)",
    all: "All",
    lowStock: "Low Stock",
    highTask: "High Task",
    reset: "Reset",
    legendHealthy: "Healthy",
    legendWatch: "Watch",
    legendCritical: "Critical",
    stock: "Stock",
    tasks: "Tasks",
    insight: "AI insight",
    quickAction: "Create quick action",
    focus: "Focus route",
  },
  hi: {
    title: "2D इंटरैक्टिव स्टोर मैप",
    subtitle: "लाइव शेल्फ इंटेलिजेंस के साथ स्पष्ट वेक्टर फ्लोरप्लान",
    search: "शेल्फ खोजें (जैसे 2A)",
    all: "सभी",
    lowStock: "कम स्टॉक",
    highTask: "ज्यादा कार्य",
    reset: "रीसेट",
    legendHealthy: "सामान्य",
    legendWatch: "नज़र रखें",
    legendCritical: "गंभीर",
    stock: "स्टॉक",
    tasks: "कार्य",
    insight: "AI सुझाव",
    quickAction: "त्वरित कार्य बनाएं",
    focus: "रूट फोकस",
  },
} as const;

function zoneTone(zone: ShelfZone) {
  if (zone.stock < 30) {
    return { fill: "rgba(239,68,68,0.38)", stroke: "rgba(248,113,113,0.95)" };
  }
  if (zone.stock < 55) {
    return { fill: "rgba(245,158,11,0.3)", stroke: "rgba(251,191,36,0.95)" };
  }
  return { fill: "rgba(16,185,129,0.28)", stroke: "rgba(52,211,153,0.95)" };
}

export function WorkerStoreMap({ zones, selectedId, zoom, language, onSelect, onZoom }: WorkerStoreMapProps) {
  const t = labels[language];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "task">("all");
  const [focusRoute, setFocusRoute] = useState(false);

  const filtered = useMemo(() => {
    return zones.filter((zone) => {
      const matchesQuery = zone.label.toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilter =
        filter === "all" ? true : filter === "low" ? zone.stock < 55 : zone.recentTasks >= 3;
      return matchesQuery && matchesFilter;
    });
  }, [zones, query, filter]);

  const active = zones.find((zone) => zone.id === selectedId) ?? null;
  const hovered = zones.find((zone) => zone.id === hoveredId) ?? null;

  return (
    <article className="lumina-glass rounded-3xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">{t.title}</h2>
          <p className="text-xs text-slate-300">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onZoom(zoom + 0.1)} className="rounded-full border border-white/20 bg-white/5 p-1.5">
            <ZoomIn className="h-3.5 w-3.5 text-slate-200" />
          </button>
          <button onClick={() => onZoom(zoom - 0.1)} className="rounded-full border border-white/20 bg-white/5 p-1.5">
            <ZoomOut className="h-3.5 w-3.5 text-slate-200" />
          </button>
          <button onClick={() => onZoom(1)} className="rounded-full border border-cyan-300/35 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-100">
            {t.reset}
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[190px] flex-1">
          <Search className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-7 py-1.5 text-xs text-white outline-none"
          />
        </div>
        <div className="flex rounded-full border border-white/15 bg-slate-900/50 p-1">
          {[
            { id: "all", label: t.all },
            { id: "low", label: t.lowStock },
            { id: "task", label: t.highTask },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as "all" | "low" | "task")}
              className={`rounded-full px-2 py-1 text-[11px] ${
                filter === item.id ? "bg-cyan-500/25 text-cyan-100" : "text-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFocusRoute((value) => !value)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${
            focusRoute ? "border-violet-300/45 bg-violet-500/20 text-violet-100" : "border-white/20 bg-white/5 text-slate-300"
          }`}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {t.focus}
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-2">
          <svg viewBox="0 0 100 100" className="h-[330px] w-full" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
            <rect x="3" y="3" width="94" height="94" rx="8" fill="#091124" stroke="rgba(0,245,255,0.3)" />

            <g stroke="rgba(148,163,184,0.2)" strokeWidth="0.25">
              {Array.from({ length: 10 }, (_, index) => (
                <line key={`v-${index}`} x1={10 + index * 9} y1="8" x2={10 + index * 9} y2="92" />
              ))}
              {Array.from({ length: 8 }, (_, index) => (
                <line key={`h-${index}`} x1="8" y1={12 + index * 10} x2="92" y2={12 + index * 10} />
              ))}
            </g>

            <rect x="8" y="8" width="84" height="84" rx="4" fill="none" stroke="rgba(148,163,184,0.42)" strokeDasharray="2 2" />
            <text x="10" y="95" fill="#94a3b8" fontSize="2.8">Entry</text>
            <circle cx="9.5" cy="91.5" r="1.7" fill="rgba(0,245,255,0.9)" />

            {filtered.map((zone) => {
              const tone = zoneTone(zone);
              const activeZone = selectedId === zone.id;
              return (
                <g key={zone.id}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width="16"
                    height="10"
                    rx="1.8"
                    fill={activeZone ? "rgba(0,245,255,0.32)" : tone.fill}
                    stroke={activeZone ? "rgba(0,245,255,0.95)" : tone.stroke}
                    strokeWidth={activeZone ? 0.9 : 0.55}
                    onMouseEnter={() => setHoveredId(zone.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSelect(zone.id)}
                    className="cursor-pointer transition"
                  />
                  <text x={zone.x + 1.6} y={zone.y + 6.2} fill="#e2e8f0" fontSize="2.25">
                    {zone.label}
                  </text>
                </g>
              );
            })}

            {focusRoute && active && (
              <>
                <path d={`M 9.5 91.5 C 22 88, 30 76, ${active.x + 8} ${active.y + 5}`} stroke="rgba(168,85,247,0.95)" strokeDasharray="1.8 1.4" fill="none" strokeWidth="0.8" />
                <circle cx={active.x + 8} cy={active.y + 5} r="1.3" fill="rgba(168,85,247,0.95)" />
              </>
            )}
          </svg>

          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-cyan-300/35 bg-slate-950/80 px-2 py-1 text-xs text-cyan-100"
            >
              {hovered.label} • {t.stock}: {hovered.stock}%
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3 text-[11px] text-slate-300">
            <div className="mb-1 inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />{t.legendHealthy}</div>
            <div className="mb-1 inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />{t.legendWatch}</div>
            <div className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />{t.legendCritical}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3 text-xs">
            {active ? (
              <>
                <p className="mb-1 text-sm text-cyan-100">{active.label}</p>
                <p className="text-slate-300">{t.stock}: {active.stock}%</p>
                <p className="text-slate-300">{t.tasks}: {active.recentTasks}</p>
                <p className="mt-1 text-slate-200">{t.insight}: {active.aiInsight}</p>
                <button className="mt-2 inline-flex items-center gap-1 rounded-full border border-cyan-300/40 bg-cyan-500/15 px-2 py-1 text-[11px] text-cyan-100">
                  <Crosshair className="h-3.5 w-3.5" />
                  {t.quickAction}
                </button>
              </>
            ) : (
              <p className="text-slate-300">{language === "en" ? "Select a shelf to view details." : "विवरण देखने के लिए शेल्फ चुनें।"}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
