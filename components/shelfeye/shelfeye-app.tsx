"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import {
  BellRing,
  BrainCircuit,
  Camera,
  CloudSun,
  Download,
  Flame,
  Gauge,
  LayoutDashboard,
  MessageCircle,
  MoonStar,
  RotateCcw,
  Scan,
  ShieldCheck,
  Siren,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { StoreMap2D } from "@/components/shelfeye/store-map-2d";
import { SpringCounter } from "@/components/2d/spring-counter";
import {
  AppSection,
  HeatCell,
  Persona,
  useCurrentStoreData,
  useShelfEyeStore,
} from "@/lib/stores/shelfeye-store";
import { useShelfEyeAuthStore } from "@/lib/stores/shelfeye-auth-store";
import { ShelfScanner } from "@/components/shelfeye/shelf-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const NAV_ITEMS: Array<{ id: AppSection; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "planogram", label: "Planogram" },
  { id: "sku", label: "SKU Intelligence" },
  { id: "alerts", label: "Alerts" },
  { id: "assistant", label: "AI Assistant" },
  { id: "settings", label: "Settings" },
];

const WIDGET_ORDER = ["kpis", "heatmap", "twin", "timeline", "trends", "decision"] as const;
const PERSONAS: Persona[] = ["manager", "worker", "analyst"];

const KPI_ITEMS = [
  { key: "revenueRecovered", label: "Revenue Recovered", prefix: "₹", tone: "text-cyan-100" },
  { key: "activeStockouts", label: "Active Stockouts", suffix: "", tone: "text-rose-100" },
  { key: "compliance", label: "Compliance", suffix: "%", tone: "text-emerald-100" },
  { key: "wmape", label: "Forecast WMAPE", suffix: "%", tone: "text-amber-100" },
  { key: "lostRevenueRisk", label: "Lost Revenue Risk", prefix: "₹", tone: "text-rose-100" },
  { key: "replenishmentEfficiency", label: "Replenishment Efficiency", suffix: "%", tone: "text-emerald-100" },
  { key: "co2Saved", label: "CO2 Saved", suffix: " kg", tone: "text-emerald-100" },
] as const;

function PulseGraph({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const path = values
    .map((value, i) => {
      const x = (i / (values.length - 1 || 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-7 w-20">
      <path d={path} stroke="#22d3ee" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function HeatTooltip({ cell }: { cell: HeatCell }) {
  return (
    <div className="rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-xs text-slate-100">
      <p>{cell.aisle}</p>
      <p>Intensity {cell.intensity}%</p>
      <p>Probability {cell.stockoutProbability}%</p>
    </div>
  );
}

function TrendCard({ title, values, forecast }: { title: string; values: number[]; forecast: number[] }) {
  const max = Math.max(...values, ...forecast, 1);
  const draw = (arr: number[]) =>
    arr
      .map((value, i) => {
        const x = (i / (arr.length - 1 || 1)) * 100;
        const y = 100 - (value / max) * 100;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  return (
    <article className="glass-panel p-4">
      <p className="text-sm text-slate-100">{title}</p>
      <svg viewBox="0 0 100 100" className="mt-3 h-44 w-full rounded-xl bg-slate-950/45 p-2">
        <path d={draw(forecast)} stroke="#a78bfa" strokeDasharray="4 4" strokeWidth="2.5" fill="none" />
        <path d={draw(values)} stroke="#34d399" strokeWidth="3" fill="none" />
      </svg>
    </article>
  );
}

function FloatingChat() {
  const chatOpen = useShelfEyeStore((s) => s.chatOpen);
  const toggleChat = useShelfEyeStore((s) => s.toggleChat);
  const persona = useShelfEyeStore((s) => s.persona);
  const setPersona = useShelfEyeStore((s) => s.setPersona);
  const chatMessages = useShelfEyeStore((s) => s.chatMessages);
  const sendChatMessage = useShelfEyeStore((s) => s.sendChatMessage);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-panel mb-3 h-[420px] w-[340px] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm text-slate-100">AI Copilot</p>
              <div className="flex gap-1">
                {(["manager", "worker"] as Persona[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setPersona(item)}
                    className={`rounded-full px-2 py-1 text-xs capitalize ${persona === item ? "bg-cyan-500/20 text-cyan-100" : "bg-white/5 text-slate-300"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div ref={listRef} className="h-[300px] space-y-2 overflow-y-auto px-4 py-3">
              {chatMessages.slice(-12).map((msg) => (
                <div key={msg.id} className={`rounded-xl px-3 py-2 text-sm ${msg.role === "assistant" ? "bg-emerald-500/15 text-emerald-50" : "bg-slate-700/45 text-slate-100"}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                sendChatMessage(draft);
                setDraft("");
              }}
              className="border-t border-white/10 p-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask ShelfEye..."
                className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2 text-sm text-white outline-none"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => toggleChat()} className="glass-panel flex h-14 w-14 items-center justify-center rounded-full border-cyan-300/50 bg-cyan-500/20 text-cyan-50">
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

function ScanOrb() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const sendChatMessage = useShelfEyeStore((s) => s.sendChatMessage);

  return (
    <>
      <button
        onClick={() => setScannerOpen(true)}
        className="glass-panel fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-blue-300/50 bg-blue-500/20 text-blue-100 shadow-lg hover:bg-blue-500/30 transition-all"
        title="Scan Shelf"
      >
        <Camera className="h-6 w-6" />
      </button>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="max-w-4xl bg-slate-950/95 border-white/10 text-white backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ShelfEye Smart Scanner
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ShelfScanner 
              onScanComplete={(result) => {
                if (result.success && result.data) {
                  const { annotatedProductCount, stockStatus } = result.data;
                  sendChatMessage(`Analysis complete: Detected ${annotatedProductCount} products with ${stockStatus} status.`);
                }
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StaffPerformanceIndicator() {
  const data = useCurrentStoreData();
  
  return (
    <article className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-cyan-400">Staff Performance Indicator</p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Live Tracking</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-white/5">
              <th className="pb-2 font-medium">STAFF</th>
              <th className="pb-2 font-medium">ROLE</th>
              <th className="pb-2 font-medium">TASKS</th>
              <th className="pb-2 font-medium">ACCURACY</th>
              <th className="pb-2 font-medium">RATING</th>
              <th className="pb-2 font-medium text-right">REMARKS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.staff.map((member) => (
              <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="text-slate-100 font-semibold">{member.name}</span>
                    <span className="text-[10px] text-slate-500">{member.id} • {member.shift}</span>
                  </div>
                </td>
                <td className="py-3 text-slate-300">{member.role}</td>
                <td className="py-3 text-slate-100 font-mono">{member.tasksCompleted}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${member.accuracy > 95 ? "bg-emerald-500" : member.accuracy > 92 ? "bg-cyan-500" : "bg-amber-500"}`}
                        style={{ width: `${member.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-300">{member.accuracy}%</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center text-amber-400">
                    <span className="font-bold mr-1">{member.rating}</span>
                    <Sparkles className="h-3 w-3 fill-current" />
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    member.remarks.includes("Excellent") || member.remarks.includes("Very") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    member.remarks.includes("improvement") ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {member.remarks}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function DashboardView() {
  const data = useCurrentStoreData();
  const setCursorMode = useShelfEyeStore((s) => s.setCursorMode);
  const selectedHeatCell = useShelfEyeStore((s) => s.selectedHeatCell);
  const selectHeatCell = useShelfEyeStore((s) => s.selectHeatCell);
  const selectedShelfId = useShelfEyeStore((s) => s.selectedShelfId);
  const selectShelf = useShelfEyeStore((s) => s.selectShelf);
  const selectedTimelineHour = useShelfEyeStore((s) => s.selectedTimelineHour);
  const setTimelineHour = useShelfEyeStore((s) => s.setTimelineHour);
  const widgetOrder = useShelfEyeStore((s) => s.widgetOrder);
  const setWidgetOrder = useShelfEyeStore((s) => s.setWidgetOrder);
  const [hoverCell, setHoverCell] = useState<HeatCell | null>(null);
  const [replSpeed, setReplSpeed] = useState(54);
  const [forecast, setForecast] = useState(74);

  const timelineFrame = data.timeline.find((f) => f.hour === selectedTimelineHour) ?? data.timeline[0];
  const simulatorLift = Math.round(((replSpeed * 1800 + forecast * 680) / 10) * (data.kpis.modelConfidence / 100));
  const decision = {
    model: "ANALYTICS_MODEL",
    event: timelineFrame.event,
    recommendedAction:
      data.kpis.activeStockouts > 18 ? "Dispatch workers to aisles 2 and 4 immediately." : "Trigger guided replenishment flow.",
    expectedRevenueLift: simulatorLift,
    confidence: data.kpis.modelConfidence,
    wmape: data.kpis.wmape,
  };

  const widgets: Record<(typeof WIDGET_ORDER)[number] | "staff", ReactNode> = {
    staff: <StaffPerformanceIndicator />,
    kpis: (
      <section className="glass-panel p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Parallax KPI Orbs</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {KPI_ITEMS.map((item) => (
            <article key={item.key} className="kpi-orb rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-100/80">{item.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${item.tone}`}>
                <SpringCounter
                  value={data.kpis[item.key]}
                  prefix={"prefix" in item ? item.prefix : ""}
                  suffix={"suffix" in item ? item.suffix : ""}
                />
              </p>
            </article>
          ))}
        </div>
      </section>
    ),
    heatmap: (
      <section className="glass-panel p-5">
        <p className="text-sm text-slate-100">Stockout Heatmap</p>
        <div className="relative mt-3 grid grid-cols-10 gap-1" onMouseEnter={() => setCursorMode("target")} onMouseLeave={() => setCursorMode("default")}>
          {data.heatmap.map((cell) => {
            const tone = cell.intensity > 75 ? "bg-rose-500/80" : cell.intensity > 50 ? "bg-amber-500/80" : "bg-emerald-500/80";
            const active = selectedHeatCell?.id === cell.id;
            return (
              <button
                key={cell.id}
                onClick={() => selectHeatCell(cell)}
                onMouseEnter={() => setHoverCell(cell)}
                onMouseLeave={() => setHoverCell(null)}
                className={`h-7 rounded-md ${tone} ${active ? "ring-2 ring-cyan-100" : ""}`}
              />
            );
          })}
          {hoverCell && (
            <div className="pointer-events-none absolute left-0 top-0 z-10 -translate-y-full">
              <HeatTooltip cell={hoverCell} />
            </div>
          )}
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-200">
          {selectedHeatCell ? (
            <div>
              <p className="font-semibold text-cyan-100">{selectedHeatCell.aisle}</p>
              <p className="mt-1 text-xs text-slate-300">Action: {selectedHeatCell.instruction}</p>
              <p className="mt-1 text-[10px] text-slate-400">Stockout Probability: {selectedHeatCell.stockoutProbability}%</p>
            </div>
          ) : (
            "Click a cell for aisle-level AI suggestion."
          )}
        </div>
      </section>
    ),
    twin: (
      <section className="glass-panel p-5">
        <p className="text-sm text-slate-100">Store Map (2D)</p>
        <div className="mt-3" onMouseEnter={() => setCursorMode("target")} onMouseLeave={() => setCursorMode("default")}>
          <StoreMap2D shelves={data.shelves} selectedShelfId={selectedShelfId} timelineHour={selectedTimelineHour} onSelectShelf={selectShelf} />
        </div>
      </section>
    ),
    timeline: (
      <section className="glass-panel p-4">
        <p className="text-sm text-slate-100">AI Insight Timeline (24h)</p>
        <div className="timeline-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2">
          {data.timeline.map((frame) => (
            <button
              key={frame.hour}
              onClick={() => {
                setTimelineHour(frame.hour);
                selectShelf(data.shelves[frame.hour % data.shelves.length].id);
              }}
              className={`min-w-[130px] rounded-xl border px-3 py-2 text-left text-xs ${frame.hour === selectedTimelineHour ? "border-cyan-300/70 bg-cyan-500/20 text-cyan-100" : "border-white/10 bg-slate-900/45 text-slate-200"}`}
            >
              <p>{frame.label}</p>
              <p className="mt-1">{frame.event}</p>
            </button>
          ))}
        </div>
      </section>
    ),
    trends: (
      <section className="grid gap-4 xl:grid-cols-2">
        <TrendCard title="Stockouts - 7 Days" values={data.trends.map((p) => p.value)} forecast={data.trends.map((p) => p.forecast)} />
        <TrendCard title="Forecast vs Actual" values={data.trends.map((p) => p.value)} forecast={data.trends.map((p) => p.forecast)} />
      </section>
    ),
    decision: (
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="glass-panel p-4">
          <p className="text-sm text-slate-100">Revenue Impact Simulator</p>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs text-slate-300">Replenishment speed {replSpeed}%</p>
              <input type="range" min={0} max={100} value={replSpeed} onChange={(e) => setReplSpeed(Number(e.target.value))} className="w-full accent-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-300">Forecast confidence {forecast}%</p>
              <input type="range" min={0} max={100} value={forecast} onChange={(e) => setForecast(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>
            <p className="text-sm text-white">Projected lift: ₹{simulatorLift.toLocaleString()}</p>
          </div>
        </article>
        <article className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-100">Best Action Right Now</p>
            <BrainCircuit className="h-4 w-4 text-violet-200" />
          </div>
          <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-slate-900/55 p-3 text-xs text-slate-200">{JSON.stringify(decision, null, 2)}</pre>
        </article>
      </section>
    ),
  };

  const normalizedOrder = [
    ...widgetOrder.filter((id): id is (typeof WIDGET_ORDER)[number] | "staff" => (WIDGET_ORDER as readonly string[]).includes(id) || id === "staff"),
    ...WIDGET_ORDER.filter((id) => !widgetOrder.includes(id)),
    ...(!widgetOrder.includes("staff") ? (["staff"] as const) : []),
  ];

  return (
    <Reorder.Group axis="y" values={normalizedOrder} onReorder={(next) => setWidgetOrder(next as string[])} className="space-y-4">
      {normalizedOrder.map((id) => (
        <Reorder.Item key={id} value={id}>
          <motion.div layout>{widgets[id as (typeof WIDGET_ORDER)[number] | "staff"]}</motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

function PlanogramView() {
  const data = useCurrentStoreData();
  const updatePlanogramDetected = useShelfEyeStore((s) => s.updatePlanogramDetected);
  const [dragged, setDragged] = useState<string | null>(null);
  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-panel p-4">
          <p className="text-sm text-slate-100">Expected</p>
          <div className="mt-3 grid gap-2">
            {data.planogramExpected.map((row, r) => (
              <div key={`exp-${r}`} className="grid grid-cols-6 gap-2">
                {row.map((item, c) => (
                  <div key={`exp-cell-${r}-${c}`} className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-2 text-xs text-slate-200">{item}</div>
                ))}
              </div>
            ))}
          </div>
        </article>
        <article className="glass-panel p-4">
          <p className="text-sm text-slate-100">Detected</p>
          <div className="mt-3 grid gap-2">
            {data.planogramDetected.map((row, r) => (
              <div key={`det-${r}`} className="grid grid-cols-6 gap-2">
                {row.map((item, c) => {
                  const mismatch = data.planogramExpected[r][c] !== item;
                  return (
                    <motion.div
                      key={`det-cell-${r}-${c}`}
                      animate={mismatch ? { opacity: [1, 0.6, 1] } : {}}
                      transition={{ duration: 1.4, repeat: mismatch ? Infinity : 0 }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("border-blue-400", "bg-blue-500/20");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("border-blue-400", "bg-blue-500/20");
                      }}
                      onDrop={(e) => {
                        e.currentTarget.classList.remove("border-blue-400", "bg-blue-500/20");
                        if (dragged) updatePlanogramDetected(r, c, dragged);
                      }}
                      className={`rounded-lg border px-2 py-2 text-xs transition-all cursor-pointer ${mismatch ? "border-rose-300/70 bg-rose-500/20 text-rose-100" : "border-white/10 bg-slate-900/50 text-slate-200"}`}
                    >
                      {item}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="glass-panel p-4">
        <p className="text-sm text-slate-100">Edit Planogram</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...new Set(data.planogramExpected.flat())].map((product) => (
            <button key={product} draggable onDragStart={() => setDragged(product)} className="rounded-full border border-white/20 bg-slate-900/55 px-3 py-1 text-xs text-slate-100">{product}</button>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          {data.planogramDetected.map((row, r) => (
            <div key={`edit-${r}`} className="grid grid-cols-6 gap-2">
              {row.map((item, c) => {
                const isOver = false; // We can add state for this if we want more fancy UI
                return (
                  <div
                    key={`drop-${r}-${c}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("border-blue-400", "bg-blue-500/20");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("border-blue-400", "bg-blue-500/20");
                    }}
                    onDrop={(e) => {
                      e.currentTarget.classList.remove("border-blue-400", "bg-blue-500/20");
                      if (dragged) updatePlanogramDetected(r, c, dragged);
                    }}
                    className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-2 text-xs text-slate-200 transition-all cursor-pointer hover:border-white/30"
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SkuView() {
  const data = useCurrentStoreData();
  const addSku = useShelfEyeStore((s) => s.addSku);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Beverages");
  const [velocity, setVelocity] = useState(40);
  const [preview, setPreview] = useState<string | null>(null);
  const [bulkApproved, setBulkApproved] = useState(false);
  
  // NEW FEATURES STATE
  const [invoice, setInvoice] = useState<any>(null);
  const [expiryRisks, setExpiryRisks] = useState<Record<string, string>>({});
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    // Load expiry data on mount
    fetch("/api/extensions?type=expiry")
      .then(res => res.json())
      .then(data => setExpiryRisks(data));
      
    // Load performance data
    fetch("/api/extensions?type=staff")
      .then(res => res.json())
      .then(data => setPerformance(data));
  }, []);

  const generateInvoice = async (product: string, stock: number) => {
    const res = await fetch(`/api/extensions?type=invoice&product=${encodeURIComponent(product)}&stock=${stock}`);
    const data = await res.json();
    setInvoice(data);
  };

  const rows = useMemo(
    () => data.skuRows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase())),
    [data.skuRows, query],
  );

  const ALTERNATIVES: Record<string, string[]> = {
    "Sparkling Water": ["Perrier", "San Pellegrino"],
    "Protein Bars": ["Kind Bars", "Clif Bars"],
    "Cold Brew": ["Iced Coffee", "Latte"],
    "Organic Milk": ["Soy Milk", "Almond Milk"],
  };

  return (
    <div className="space-y-5">
      <section className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-100">SKU Intelligence</p>
            {performance && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/30">
                Avg Restock Time: {performance.response_time}
              </span>
            )}
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search SKU" className="rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none" />
        </div>
        <div className="mt-3 overflow-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.14em] text-slate-400">
              <tr><th className="pb-2">SKU</th><th className="pb-2">Category</th><th className="pb-2">Risk</th><th className="pb-2">Demand</th><th className="pb-2">AI Insight</th><th className="pb-2 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOutOfStock = row.riskScore > 80;
                const alternatives = isOutOfStock ? ALTERNATIVES[row.name] : null;
                const expiryRisk = expiryRisks[row.name.toLowerCase()];
                
                return (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-100">{row.name}</span>
                        {expiryRisk && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            expiryRisk === "High Risk" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : 
                            "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}>
                            {expiryRisk}
                          </span>
                        )}
                      </div>
                      {alternatives && (
                        <p className="text-[10px] text-rose-300/80 italic mt-0.5">
                          {row.name} unavailable → Try {alternatives[0]}
                        </p>
                      )}
                    </td>
                    <td className="py-2 text-slate-300">{row.category}</td>
                    <td className="py-2"><span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-100">{row.riskScore}</span></td>
                    <td className="py-2 text-slate-100">{row.demandVelocity}/hr</td>
                    <td className="py-2 text-slate-300">{row.aiInsight}</td>
                    <td className="py-2 text-right">
                      {(row.riskScore > 60) && (
                        <button 
                          onClick={() => generateInvoice(row.name, 100 - row.riskScore)}
                          className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-500/30"
                        >
                          Generate Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* INVOICE MODAL */}
      <AnimatePresence>
        {invoice && (
          <Dialog open={!!invoice} onOpenChange={() => setInvoice(null)}>
            <DialogContent className="max-w-md bg-slate-950/95 border-white/10 text-white backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-cyan-400">Restock Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-2">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Product</span>
                  <span className="font-bold text-white">{invoice.product}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Reorder Quantity</span>
                  <span className="text-white">{invoice.reorder_qty} units</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Unit Price</span>
                  <span className="text-white">₹{invoice.unit_price}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Total Cost</span>
                  <span className="text-2xl font-black text-emerald-400">₹{invoice.total_cost}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-400">Supplier</span>
                  <span className="text-cyan-200">{invoice.supplier}</span>
                </div>
                <button 
                  onClick={() => setInvoice(null)}
                  className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-xl"
                >
                  Send to Supplier
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-panel p-4">
          <p className="text-sm text-slate-100">Add Product</p>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (!name.trim()) return;
              addSku({ name: name.trim(), category, velocity });
              setName("");
            }}
            className="mt-3 space-y-3"
          >
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none">
                {["Beverages", "Snacks", "Dairy", "Pantry", "Fresh"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <input type="number" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none" />
            </div>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setPreview(URL.createObjectURL(e.target.files[0]))} className="text-xs text-slate-300" />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-24 w-full rounded-xl object-cover" />
            )}
            <button className="rounded-full border border-emerald-300/70 bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100">Add SKU</button>
          </form>
        </article>
        <article className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-100">Auto-Replenishment Engine</p>
            <button onClick={() => setBulkApproved((v) => !v)} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{bulkApproved ? "Bulk Approved" : "Bulk Approve"}</button>
          </div>
          <div className="mt-3 space-y-2">
            {data.skuRows.slice(0, 6).map((row) => (
              <div key={`engine-${row.id}`} className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-xs text-slate-200">
                <div className="flex items-center justify-between"><span>{row.name}</span><span>{row.confidence}% confidence</span></div>
                <p className="mt-1">Suggested replenishment: {Math.round(row.demandVelocity * 1.2)} units</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function AlertsView() {
  const data = useCurrentStoreData();
  const simulateAlert = useShelfEyeStore((s) => s.simulateAlert);
  const predictive = useMemo(() => [...data.heatmap].sort((a, b) => b.stockoutProbability - a.stockoutProbability).slice(0, 5), [data.heatmap]);
  return (
    <div className="space-y-5">
      <section className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-100">Real-time Alert Feed</p>
          <button onClick={simulateAlert} className="rounded-full border border-cyan-300/70 bg-cyan-500/20 px-4 py-2 text-xs text-cyan-100">Simulate new alert</button>
        </div>
        <div className="mt-3 space-y-2">
          {data.alerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
              <div className="flex items-center justify-between text-sm"><p className="text-slate-100">{alert.title}</p><p className="text-xs text-slate-300">${alert.impact.toLocaleString()}</p></div>
              <p className="mt-1 text-xs text-slate-300">ETA {alert.etaMinutes}m - {alert.suggestion}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-panel p-4">
          <p className="text-sm text-slate-100">Priority Queue</p>
          <div className="mt-3 space-y-2">
            {[...data.alerts].sort((a, b) => b.impact - a.impact).slice(0, 6).map((alert) => (
              <div key={`pq-${alert.id}`} className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-100">
                {alert.title} <span className="text-xs text-slate-300">({alert.etaMinutes}m)</span>
              </div>
            ))}
          </div>
        </article>
        <article className="glass-panel p-4">
          <p className="text-sm text-slate-100">Upcoming Stockout Risk</p>
          <div className="mt-3 space-y-2">
            {predictive.map((cell) => (
              <div key={cell.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-200">
                {cell.aisle} - {cell.stockoutProbability}%
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function AssistantView() {
  const persona = useShelfEyeStore((s) => s.persona);
  const setPersona = useShelfEyeStore((s) => s.setPersona);
  const chatMessages = useShelfEyeStore((s) => s.chatMessages);
  const sendChatMessage = useShelfEyeStore((s) => s.sendChatMessage);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  return (
    <section className="glass-panel h-[72vh] overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm text-slate-100">AI Assistant</p>
        <div className="flex gap-1">
          {PERSONAS.map((item) => (
            <button key={item} onClick={() => setPersona(item)} className={`rounded-full px-3 py-1 text-xs capitalize ${persona === item ? "bg-emerald-500/20 text-emerald-100" : "bg-white/5 text-slate-300"}`}>{item}</button>
          ))}
        </div>
      </div>
      <div ref={listRef} className="h-[calc(72vh-128px)] space-y-2 overflow-y-auto px-4 py-3">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`max-w-3xl rounded-xl px-3 py-2 text-sm ${msg.role === "assistant" ? "bg-emerald-500/15 text-emerald-50" : "ml-auto bg-slate-700/50 text-slate-100"}`}>{msg.text}</div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; sendChatMessage(draft); setDraft(""); }} className="border-t border-white/10 p-3">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask based on live dashboard data..." className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2 text-sm text-white outline-none" />
      </form>
    </section>
  );
}

function SettingsView() {
  const { theme, setTheme } = useTheme();
  const notificationsEnabled = useShelfEyeStore((s) => s.notificationsEnabled);
  const shortcutsEnabled = useShelfEyeStore((s) => s.shortcutsEnabled);
  const presenceEnabled = useShelfEyeStore((s) => s.presenceEnabled);
  const setNotificationPreference = useShelfEyeStore((s) => s.setNotificationPreference);
  const setShortcutPreference = useShelfEyeStore((s) => s.setShortcutPreference);
  const setPresencePreference = useShelfEyeStore((s) => s.setPresencePreference);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="glass-panel p-4">
        <p className="text-sm text-slate-100">Settings</p>
        <div className="mt-3 space-y-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-100">
            Theme {theme === "dark" ? <MoonStar className="h-4 w-4" /> : <CloudSun className="h-4 w-4" />}
          </button>
          <button onClick={() => setNotificationPreference(!notificationsEnabled)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-100">Notifications <span className="text-xs">{notificationsEnabled ? "On" : "Off"}</span></button>
          <button onClick={() => setShortcutPreference(!shortcutsEnabled)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-100">Keyboard shortcuts <span className="text-xs">{shortcutsEnabled ? "On" : "Off"}</span></button>
          <button onClick={() => setPresencePreference(!presenceEnabled)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-100">Presence avatars <span className="text-xs">{presenceEnabled ? "On" : "Off"}</span></button>
        </div>
      </article>
      <article className="glass-panel p-4">
        <p className="text-sm text-slate-100">Export Studio</p>
        <button onClick={() => window.print()} className="mt-3 flex w-full items-center justify-between rounded-xl border border-emerald-300/70 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">Export PDF / Slides <Download className="h-4 w-4" /></button>
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-200">
          <p>Keyboard shortcuts: D = Dashboard, P = Planogram, A = Alerts.</p>
          <p className="mt-2">Onboarding tour is enabled for first-time users.</p>
        </div>
      </article>
    </div>
  );
}

export function ShelfEyeApp() {
  const router = useRouter();
  const section = useShelfEyeStore((s) => s.section);
  const setSection = useShelfEyeStore((s) => s.setSection);
  const currentStore = useShelfEyeStore((s) => s.currentStore);
  const switchStore = useShelfEyeStore((s) => s.switchStore);
  const refreshLiveData = useShelfEyeStore((s) => s.refreshLiveData);
  const decrementAlertTimers = useShelfEyeStore((s) => s.decrementAlertTimers);
  const shortcutsEnabled = useShelfEyeStore((s) => s.shortcutsEnabled);
  const presenceEnabled = useShelfEyeStore((s) => s.presenceEnabled);
  const data = useCurrentStoreData();
  const user = useShelfEyeAuthStore((s) => s.user);
  const logout = useShelfEyeAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();
  const [latencyHistory, setLatencyHistory] = useState<number[]>([data.kpis.latencyMs]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshLiveData();
      decrementAlertTimers();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [decrementAlertTimers, refreshLiveData]);

  useEffect(() => {
    setLatencyHistory((prev) => [...prev.slice(-18), data.kpis.latencyMs]);
  }, [data.kpis.latencyMs]);

  useEffect(() => {
    if (!shortcutsEnabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const key = event.key.toLowerCase();
      if (key === "d") setSection("dashboard");
      if (key === "p") setSection("planogram");
      if (key === "a") setSection("alerts");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSection, shortcutsEnabled]);

  return (
    <div className="relative min-h-screen px-4 pb-16 sm:px-8">
      <ScanOrb />
      <FloatingChat />

      <header className="sticky top-4 z-40 mt-4 flex items-center justify-between gap-4 rounded-3xl border border-white/15 bg-slate-950/55 px-4 py-3 backdrop-blur-3xl">
        <div className="flex items-center gap-2 text-sm text-white"><Sparkles className="h-4 w-4 text-emerald-300" />ShelfEye</div>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setSection(item.id)} className={`rounded-full px-3 py-1.5 text-xs ${section === item.id ? "bg-cyan-500/25 text-cyan-100" : "text-slate-300 hover:bg-white/5"}`}>{item.label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-300 md:block">
            {user ? `${user.name} • ${user.role}` : "Demo user"}
          </span>
          <button
            onClick={() => {
              logout();
              router.push("/auth");
            }}
            className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200 md:block"
          >
            Sign out
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full border border-white/15 bg-slate-900/50 p-2 text-slate-200">{theme === "dark" ? <MoonStar className="h-4 w-4" /> : <CloudSun className="h-4 w-4" />}</button>
          <div className="hidden items-center rounded-full border border-white/15 bg-slate-900/50 px-3 py-1 text-xs text-slate-200 md:flex"><Gauge className="mr-2 h-3.5 w-3.5 text-cyan-300" /><PulseGraph values={latencyHistory} /><span>{data.kpis.latencyMs}ms</span></div>
          {presenceEnabled && (
            <div className="hidden items-center gap-1 md:flex">
              {["M", "W", "A"].map((label, i) => (
                <span key={label} className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-slate-950 ${i === 0 ? "bg-cyan-400" : i === 1 ? "bg-emerald-400" : "bg-violet-400"}`}>{label}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mt-6 space-y-5">
        <section className="glass-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex gap-2">
            {(["A", "B", "C"] as const).map((store) => (
              <button key={store} onClick={() => switchStore(store)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${currentStore === store ? "bg-emerald-400/20 text-emerald-100" : "bg-white/5 text-slate-300"}`}>Store {store}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <BellRing className="h-4 w-4" />
            Auto-refresh every 5s
            <button onClick={() => refreshLiveData()} className="rounded-full border border-white/15 bg-white/5 p-1.5"><RotateCcw className="h-3.5 w-3.5" /></button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <article className="glass-panel p-4"><LayoutDashboard className="h-4 w-4 text-cyan-300" /><p className="mt-2 text-xs text-slate-300">Section</p><p className="text-sm text-white capitalize">{section}</p></article>
          <article className="glass-panel p-4"><Siren className="h-4 w-4 text-rose-300" /><p className="mt-2 text-xs text-slate-300">Stockouts</p><p className="text-sm text-white">{data.kpis.activeStockouts}</p></article>
          <article className="glass-panel p-4"><Gauge className="h-4 w-4 text-amber-300" /><p className="mt-2 text-xs text-slate-300">WMAPE</p><p className="text-sm text-white">{data.kpis.wmape}%</p></article>
          <article className="glass-panel p-4"><ShieldCheck className="h-4 w-4 text-emerald-300" /><p className="mt-2 text-xs text-slate-300">Compliance</p><p className="text-sm text-white">{data.kpis.compliance}%</p></article>
          <article className="glass-panel p-4"><Flame className="h-4 w-4 text-rose-300" /><p className="mt-2 text-xs text-slate-300">Revenue risk</p><p className="text-sm text-white">₹{data.kpis.lostRevenueRisk.toLocaleString()}</p></article>
          <article className="glass-panel p-4"><WandSparkles className="h-4 w-4 text-emerald-300" /><p className="mt-2 text-xs text-slate-300">CO2 saved</p><p className="text-sm text-white">{data.kpis.co2Saved}kg</p></article>
        </section>

        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {section === "dashboard" && <DashboardView />}
            {section === "planogram" && <PlanogramView />}
            {section === "sku" && <SkuView />}
            {section === "alerts" && <AlertsView />}
            {section === "assistant" && <AssistantView />}
            {section === "settings" && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-4 left-4 z-40 lg:hidden">
        <div className="glass-panel flex items-center gap-1 rounded-full px-2 py-1.5">
          {NAV_ITEMS.map((item) => (
            <button key={`mobile-${item.id}`} onClick={() => setSection(item.id)} className={`rounded-full px-2 py-1 text-[10px] ${section === item.id ? "bg-cyan-500/25 text-cyan-100" : "text-slate-300"}`}>
              {item.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
