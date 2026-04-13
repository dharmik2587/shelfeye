"use client";
/* eslint-disable @next/next/no-img-element */

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Globe2,
  LayoutGrid,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  initialAlerts,
  managerRevenueSeries,
  managerStores,
  workerPerformance,
  type LiveAlert,
} from "@/lib/data/shelfeye-dashboard-data";
import { subscribeToRealtimeAlerts } from "@/lib/realtime/supabase-alert-stream";
import { useDashboardUiStore } from "@/lib/stores/dashboard-ui-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { CommandPalette } from "@/components/shelfeye/command-palette";
import { LanguageToggle } from "@/components/shelfeye/language-toggle";

function NeonOrb() {
  useFrame((state) => {
    state.scene.rotation.y = state.clock.elapsedTime * 0.28;
  });
  return (
    <mesh>
      <torusGeometry args={[1.1, 0.35, 28, 120]} />
      <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.5} />
    </mesh>
  );
}

function ChartPath({
  values,
  tone,
  dashed = false,
}: {
  values: number[];
  tone: string;
  dashed?: boolean;
}) {
  const max = Math.max(...values, 1);
  const path = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return <path d={path} stroke={tone} strokeWidth={3} fill="none" strokeDasharray={dashed ? "5 5" : undefined} />;
}

const PANEL_ORDER = [
  "storeHealth",
  "alerts",
  "revenue",
  "worker",
  "analytics",
  "planogram",
  "comparison",
  "multistore",
] as const;

const copy = {
  en: {
    storeHealth: "Store Health Overview",
    healthScore: "Global Health Score",
    liveAlerts: "Live Alerts",
    revenueProfit: "Revenue & Profit",
    workerMgmt: "Worker Management",
    analytics: "Analytics",
    planogram: "Planogram Viewer",
    comparison: "Comparison Mode",
    multistore: "Multi-Store Map",
    assignTask: "Assign Task",
    optimizePlanogram: "Optimize Planogram",
    search: "Search workers, alerts, SKU...",
    aiCopilot: "AI Co-Pilot",
    close: "Close",
  },
  hi: {
    storeHealth: "स्टोर हेल्थ ओवरव्यू",
    healthScore: "ग्लोबल हेल्थ स्कोर",
    liveAlerts: "लाइव अलर्ट",
    revenueProfit: "राजस्व और लाभ",
    workerMgmt: "वर्कर मैनेजमेंट",
    analytics: "एनालिटिक्स",
    planogram: "प्लानोग्राम व्यूअर",
    comparison: "तुलना मोड",
    multistore: "मल्टी-स्टोर मैप",
    assignTask: "कार्य सौंपें",
    optimizePlanogram: "प्लानोग्राम ऑप्टिमाइज़ करें",
    search: "वर्कर, अलर्ट, SKU खोजें...",
    aiCopilot: "AI को-पायलट",
    close: "बंद करें",
  },
} as const;

export function ManagerDashboard() {
  const [selectedStore, setSelectedStore] = useState(managerStores[0].id);
  const [search, setSearch] = useState("");
  const [alertsFilter, setAlertsFilter] = useState<"all" | "critical" | "inventory" | "staff">("all");
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [planogramOptimized, setPlanogramOptimized] = useState(false);
  const [panelOrder, setPanelOrder] = useState<Array<(typeof PANEL_ORDER)[number]>>([...PANEL_ORDER]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const language = useLanguageStore((state) => state.language);
  const t = copy[language];

  const managerCopilotOpen = useDashboardUiStore((state) => state.managerCopilotOpen);
  const toggleManagerCopilot = useDashboardUiStore((state) => state.toggleManagerCopilot);

  const [alerts, setAlerts] = useState<LiveAlert[]>(initialAlerts);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 760);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeAlerts((incoming) => {
      setAlerts((current) => [incoming, ...current].slice(0, 24));
    });
    return unsubscribe;
  }, []);

  const filteredAlerts = useMemo(
    () => alerts.filter((alert) => (alertsFilter === "all" ? true : alert.type === alertsFilter)),
    [alerts, alertsFilter],
  );

  const visibleWorkers = useMemo(
    () => workerPerformance.filter((worker) => worker.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const storeMetrics = useMemo(() => managerStores.find((store) => store.id === selectedStore) ?? managerStores[0], [selectedStore]);

  if (!ready) {
    return (
      <div className="lumina-root min-h-screen p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="lumina-glass h-14 rounded-3xl lumina-skeleton" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="lumina-glass h-72 rounded-3xl lumina-skeleton" />
            <div className="lumina-glass h-72 rounded-3xl lumina-skeleton" />
          </div>
          <div className="lumina-glass h-80 rounded-3xl lumina-skeleton" />
        </div>
      </div>
    );
  }

  const demandSeries = [64, 66, 70, 74, 77, 81, 84];
  const forecastSeries = [63, 65, 69, 71, 74, 79, 82];
  const sortedWorkers = [...visibleWorkers].sort((a, b) => b.score - a.score);

  const panels: Record<(typeof PANEL_ORDER)[number], ReactNode> = {
    storeHealth: (
      <article className="lumina-glass rounded-3xl p-4 lg:col-span-2">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              {t.storeHealth}
            </div>
            <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/55 p-4">
              <p className="text-sm text-slate-300">{t.healthScore}</p>
              <p className="mt-1 text-5xl font-semibold text-cyan-100">{storeMetrics.score}%</p>
              <p className="mt-2 text-xs text-emerald-300">+2.1% vs last 7 days</p>
              <svg viewBox="0 0 100 30" className="mt-3 h-14 w-full">
                <ChartPath values={[78, 80, 82, 85, 87, 90, 92]} tone="#00f5ff" />
              </svg>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {[
                ["Footfall", "12.8K", "text-cyan-100"],
                ["Conversion", "41.2%", "text-violet-200"],
                ["Accuracy", "96.3%", "text-emerald-200"],
                ["Revenue", "₹248K", "text-cyan-100"],
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">
                  <p className="text-[11px] text-slate-400">{label}</p>
                  <p className={`mt-1 text-lg ${tone}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="h-64 overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-900/55">
            <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[2, 2, 2]} intensity={2.5} color="#00f5ff" />
              <NeonOrb />
            </Canvas>
          </div>
        </div>
      </article>
    ),
    alerts: (
      <article className="lumina-glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{t.liveAlerts}</h2>
          <div className="flex items-center gap-1">
            {(["all", "critical", "inventory", "staff"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAlertsFilter(tab)}
                className={`rounded-full px-2 py-1 text-[11px] capitalize ${
                  alertsFilter === tab ? "bg-cyan-500/20 text-cyan-100" : "bg-white/5 text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredAlerts.slice(0, 6).map((alert) => (
            <div key={alert.id} className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-100">{alert.title}</p>
                <button onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)} className="text-[11px] text-cyan-200">Details</button>
              </div>
              <p className="mt-1 text-xs text-slate-300">{alert.message}</p>
              {expandedAlertId === alert.id && (
                <div className="mt-2 flex gap-2 text-[11px]">
                  <button className="rounded-full border border-violet-300/40 bg-violet-500/20 px-2 py-1 text-violet-100">Assign</button>
                  <button className="rounded-full border border-emerald-300/40 bg-emerald-500/20 px-2 py-1 text-emerald-100">Resolve</button>
                  <button className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-slate-300">Ignore</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>
    ),
    revenue: (
      <article className="lumina-glass rounded-3xl p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">{t.revenueProfit}</h2>
        <svg viewBox="0 0 100 100" className="h-44 w-full rounded-2xl bg-slate-900/55 p-2">
          <ChartPath values={managerRevenueSeries.map((row) => row.revenue)} tone="#00f5ff" />
          <ChartPath values={managerRevenueSeries.map((row) => row.profit)} tone="#a855f7" dashed />
        </svg>
        <div className="mt-3 space-y-2">
          <div className="rounded-2xl border border-violet-300/30 bg-violet-500/15 p-2 text-xs text-violet-100">
            Peak hour conversion dropped 11% on aisle 3 — planogram violation detected.
          </div>
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-500/15 p-2 text-xs text-cyan-100">
            Profit lift opportunity: automate replenishment in beverage zone.
          </div>
        </div>
      </article>
    ),
    worker: (
      <article className="lumina-glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{t.workerMgmt}</h2>
          <button onClick={() => setAssignModalOpen(true)} className="rounded-full border border-cyan-300/40 bg-cyan-500/20 px-3 py-1 text-[11px] text-cyan-100">{t.assignTask}</button>
        </div>
        <div className="space-y-2">
          {sortedWorkers.map((worker) => (
            <div key={worker.id} className="rounded-2xl border border-white/10 bg-slate-900/55 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-100">{worker.name}</span>
                <span className="text-slate-300">{worker.shiftStatus}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-cyan-300" style={{ width: `${worker.score}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/55 p-3">
          <p className="text-xs text-slate-300">Attendance heatmap</p>
          <div className="mt-2 grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }, (_, index) => (
              <div
                key={`heat-${index}`}
                className={`h-3 rounded ${index % 5 === 0 ? "bg-emerald-400/70" : index % 4 === 0 ? "bg-violet-400/70" : "bg-slate-700"}`}
              />
            ))}
          </div>
        </div>
      </article>
    ),
    analytics: (
      <article className="lumina-glass rounded-3xl p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">{t.analytics}</h2>
        <svg viewBox="0 0 100 100" className="h-44 w-full rounded-2xl bg-slate-900/55 p-2">
          <ChartPath values={demandSeries} tone="#10b981" />
          <ChartPath values={forecastSeries} tone="#00f5ff" dashed />
        </svg>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {Array.from({ length: 16 }, (_, index) => {
            const value = Math.round(30 + Math.sin(index * 0.6) * 28 + 38);
            return (
              <button
                key={`stock-cell-${index}`}
                className={`h-10 rounded text-[10px] ${value > 80 ? "bg-red-500/40 text-red-100" : value > 55 ? "bg-amber-500/35 text-amber-100" : "bg-emerald-500/35 text-emerald-100"}`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </article>
    ),
    planogram: (
      <article className="lumina-glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{t.planogram}</h2>
          <button
            onClick={() => setPlanogramOptimized((value) => !value)}
            className="rounded-full border border-violet-300/40 bg-violet-500/20 px-3 py-1 text-[11px] text-violet-100"
          >
            {t.optimizePlanogram}
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 18 }, (_, index) => (
            <motion.div
              key={`plan-${index}`}
              layout
              whileHover={{ y: -2 }}
              className={`rounded-lg border p-2 text-[11px] ${
                planogramOptimized && index % 3 === 0
                  ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                  : "border-white/10 bg-slate-900/55 text-slate-200"
              }`}
            >
              SKU {index + 1}
            </motion.div>
          ))}
        </div>
      </article>
    ),
    comparison: (
      <article className="lumina-glass rounded-3xl p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">{t.comparison}</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80" alt="before" className="h-44 w-full object-cover" />
            <span className="absolute left-2 top-2 rounded-full bg-slate-950/70 px-2 py-1 text-[10px]">Before</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <img src="https://images.unsplash.com/photo-1605651202774-7d573fd0e5b6?auto=format&fit=crop&w=800&q=80" alt="after" className="h-44 w-full object-cover" />
            <span className="absolute left-2 top-2 rounded-full bg-emerald-500/50 px-2 py-1 text-[10px]">After</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-white/10 bg-slate-900/55 p-2">Compliance: 93% → 97%</div>
          <div className="rounded-xl border border-white/10 bg-slate-900/55 p-2">Time saved: +1h 14m</div>
        </div>
      </article>
    ),
    multistore: (
      <article className="lumina-glass rounded-3xl p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">{t.multistore}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {managerStores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store.id)}
              className={`rounded-2xl border p-3 text-left text-xs ${
                selectedStore === store.id
                  ? "border-cyan-300/65 bg-cyan-500/15 text-cyan-100"
                  : "border-white/10 bg-slate-900/55 text-slate-200"
              }`}
            >
              <p className="font-medium">{store.label}</p>
              <p className="mt-1">Score {store.score}% • Alerts {store.alerts}</p>
              <p className="mt-1">{store.revenue}</p>
            </button>
          ))}
        </div>
      </article>
    ),
  };

  return (
    <div className="lumina-root min-h-screen pb-8 text-slate-100">
      <CommandPalette />

      <header className="sticky top-0 z-30 border-b border-cyan-300/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded-full border border-white/20 bg-white/5 p-2 text-slate-200"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <div className="relative w-[250px]">
            <button className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
              <span>{storeMetrics.flag} • {storeMetrics.label}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-9 py-2 text-sm text-white outline-none"
            />
          </div>
          <LanguageToggle />
          <button className="relative rounded-full border border-white/15 bg-slate-900/60 p-2 text-slate-200">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>
          <button className="rounded-full border border-white/15 bg-slate-900/60 p-2 text-slate-200">
            <Users className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto mt-4 grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[84px_1fr]">
        <aside className={`space-y-2 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
          {[
            { label: "Home", icon: Sparkles },
            { label: "Ops", icon: ShieldCheck },
            { label: "Stores", icon: Globe2 },
            { label: "Config", icon: Settings2 },
          ].map((item) => (
            <button key={item.label} className="lumina-glass flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs text-slate-200">
              <item.icon className="h-4 w-4 text-cyan-300" />
              <span className="hidden xl:block">{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="relative">
          <Reorder.Group axis="y" values={panelOrder} onReorder={setPanelOrder} className="grid gap-4 xl:grid-cols-2">
            {panelOrder.map((panelId) => (
              <Reorder.Item key={panelId} value={panelId} className={panelId === "storeHealth" ? "xl:col-span-2" : ""}>
                <motion.div layout transition={{ type: "spring", stiffness: 230, damping: 24 }}>
                  {panels[panelId]}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <motion.aside
            animate={{ x: managerCopilotOpen ? 0 : 310 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="fixed right-2 top-28 z-40 w-[300px] rounded-3xl border border-cyan-300/20 bg-slate-950/85 p-3 backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-cyan-100">{t.aiCopilot}</p>
              <button onClick={() => toggleManagerCopilot()} className="rounded-full border border-white/20 px-2 py-1 text-[11px] text-slate-300">
                {managerCopilotOpen ? "Collapse" : "Open"}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-2 text-slate-200">
                Aisle 3 peak-hour conversion dropped 11%; assign visual audit.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-2 text-slate-200">
                Recommend staffing +1 worker between 18:00 and 20:00.
              </div>
            </div>
          </motion.aside>
        </main>
      </div>

      <AnimatePresence>
        {assignModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAssignModalOpen(false)}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-cyan-300/20 bg-slate-950/90 p-4"
            >
              <h3 className="text-lg font-semibold text-white">{t.assignTask}</h3>
              <p className="mt-1 text-xs text-slate-300">AI suggestion: assign Planogram Audit to Rahul Sharma (97 score).</p>
              <div className="mt-3 space-y-2">
                <input className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none" placeholder="Task title" />
                <input className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none" placeholder="Shelf/location" />
                <button className="w-full rounded-2xl border border-cyan-300/40 bg-cyan-500/20 px-3 py-2 text-sm text-cyan-100">Assign Now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
