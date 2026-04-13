"use client";
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bot,
  Camera,
  ClipboardList,
  ImageUp,
  MapPinned,
  Mic,
  Plus,
  Scan,
  Send,
  Siren,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import {
  inventoryItems,
  initialAlerts,
  initialWorkerTasks,
  misplacedItems,
  shelfZones,
  type LiveAlert,
  type WorkerTask,
} from "@/lib/data/shelfeye-dashboard-data";
import { subscribeToRealtimeAlerts } from "@/lib/realtime/supabase-alert-stream";
import { useDashboardUiStore } from "@/lib/stores/dashboard-ui-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { CommandPalette } from "@/components/shelfeye/command-palette";
import { LanguageToggle } from "@/components/shelfeye/language-toggle";
import { WorkerStoreMap } from "@/components/shelfeye/worker-store-map";
import { ShelfScanner } from "@/components/shelfeye/shelf-scanner";

const STATUS_COLORS = {
  critical: "bg-red-500/25 text-red-200 border-red-300/40",
  high: "bg-amber-500/25 text-amber-200 border-amber-300/40",
  medium: "bg-emerald-500/25 text-emerald-200 border-emerald-300/40",
};

const workerTabs = [
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "scan", label: "Scan", icon: Scan },
  { id: "map", label: "Map", icon: MapPinned },
  { id: "alerts", label: "Alerts", icon: Siren },
  { id: "assistant", label: "AI", icon: Bot },
] as const;

const tabLabels = {
  en: { tasks: "Tasks", scan: "Scan", map: "Map", alerts: "Alerts", assistant: "AI" },
  hi: { tasks: "कार्य", scan: "स्कैन", map: "मैप", alerts: "अलर्ट", assistant: "AI" },
} as const;

const copy = {
  en: {
    store: "ShelfEye • Downtown Store",
    aiConfidence: "AI Confidence",
    assignedTasks: "Assigned Tasks",
    dragHint: "Drag, reorder, swipe complete",
    dueIn: "Due in",
    shelfInspection: "Shelf Inspection",
    scanShelf: "Scan Shelf",
    latestScan: "Latest scan",
    latestScanDesc: "Before/After compare available with AI detection overlays.",
    modelStatus: "Model status",
    modelStatusDesc: "Computer Vision v3 online • 98ms avg inference latency.",
    misplaced: "Misplaced Products",
    moveNow: "Move Now",
    backInventory: "Back Inventory",
    quickReorder: "Quick Reorder",
    attendance: "Attendance & Shift",
    shiftTimer: "Shift timer",
    checkIn: "Check In",
    checkOut: "Check Out",
    autoRefresh: "Auto-refresh every 5s",
    liveAlerts: "Live Alerts",
    close: "Close",
    markResolved: "Mark resolved",
    assistant: "AI Assistant",
    askAi: "Ask AI...",
    scan: "Scan Shelf",
    analyze: "Analyze with AI",
    analysisDone: "Analysis complete: 3 issues found • 1 critical action required.",
    selectShelf: "Select a shelf for contextual insights.",
    shiftSummary: "Shift Summary",
    tasksCompleted: "Tasks completed",
    itemsScanned: "Items scanned",
    accuracyScore: "Accuracy score",
    aiContribution: "AI contribution",
    coachingTip: "Coaching tip: Focus on high-risk aisles in the first 30 minutes to lift compliance faster.",
    closeSummary: "Close Summary",
  },
  hi: {
    store: "ShelfEye • डाउनटाउन स्टोर",
    aiConfidence: "AI विश्वास स्तर",
    assignedTasks: "असाइन किए गए कार्य",
    dragHint: "खींचें, क्रम बदलें, स्वाइप से पूरा करें",
    dueIn: "बाकी समय",
    shelfInspection: "शेल्फ निरीक्षण",
    scanShelf: "शेल्फ स्कैन करें",
    latestScan: "नवीनतम स्कैन",
    latestScanDesc: "AI ओवरले के साथ Before/After तुलना उपलब्ध।",
    modelStatus: "मॉडल स्थिति",
    modelStatusDesc: "Computer Vision v3 ऑनलाइन • 98ms औसत लेटेंसी।",
    misplaced: "गलत जगह रखे प्रोडक्ट",
    moveNow: "अभी शिफ्ट करें",
    backInventory: "बैक इन्वेंटरी",
    quickReorder: "त्वरित रीऑर्डर",
    attendance: "उपस्थिति और शिफ्ट",
    shiftTimer: "शिफ्ट टाइमर",
    checkIn: "चेक-इन",
    checkOut: "चेक-आउट",
    autoRefresh: "हर 5 सेकंड में ऑटो-रिफ्रेश",
    liveAlerts: "लाइव अलर्ट",
    close: "बंद करें",
    markResolved: "समाधान किया",
    assistant: "AI सहायक",
    askAi: "AI से पूछें...",
    scan: "शेल्फ स्कैन करें",
    analyze: "AI से विश्लेषण करें",
    analysisDone: "विश्लेषण पूरा: 3 समस्याएँ मिलीं • 1 गंभीर कार्रवाई आवश्यक।",
    selectShelf: "संदर्भित जानकारी के लिए शेल्फ चुनें।",
    shiftSummary: "शिफ्ट सारांश",
    tasksCompleted: "पूर्ण कार्य",
    itemsScanned: "स्कैन आइटम",
    accuracyScore: "सटीकता स्कोर",
    aiContribution: "AI योगदान",
    coachingTip: "कोचिंग टिप: पहले 30 मिनट में हाई-रिस्क आइल पर ध्यान दें ताकि कंप्लायंस तेजी से बढ़े।",
    closeSummary: "सारांश बंद करें",
  },
} as const;

const previewBefore =
  "https://images.unsplash.com/photo-1561715276-a2d087060f1d?auto=format&fit=crop&w=1300&q=80";
const previewAfter =
  "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=1300&q=80";

const detectionBoxes = [
  { id: "box-1", label: "Misplaced", confidence: 95, x: 18, y: 24, w: 26, h: 22, tone: "border-red-300/70 bg-red-400/20" },
  { id: "box-2", label: "Low Stock", confidence: 89, x: 52, y: 42, w: 22, h: 20, tone: "border-amber-300/70 bg-amber-400/20" },
  { id: "box-3", label: "Damaged", confidence: 81, x: 74, y: 20, w: 16, h: 18, tone: "border-violet-300/70 bg-violet-400/20" },
];

let taskDb: WorkerTask[] = [...initialWorkerTasks];
let alertDb: LiveAlert[] = [...initialAlerts];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function InventoryRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16">
      <circle cx="32" cy="32" r="26" stroke="rgba(148,163,184,0.2)" strokeWidth="7" fill="none" />
      <circle
        cx="32"
        cy="32"
        r="26"
        stroke={value < 25 ? "#ef4444" : value < 45 ? "#f59e0b" : "#10b981"}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" className="fill-slate-100 text-[13px] font-semibold">
        {value}%
      </text>
    </svg>
  );
}

export function WorkerDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<(typeof workerTabs)[number]["id"]>("tasks");
  const [ready, setReady] = useState(false);
  const [nowLabel, setNowLabel] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [afterSlider, setAfterSlider] = useState(56);
  const [inspectionImage, setInspectionImage] = useState<string | null>(null);
  const [inspectionAnalyzing, setInspectionAnalyzing] = useState(false);
  const [inspectionComplete, setInspectionComplete] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<Array<{ id: string; role: "assistant" | "user"; text: string }>>([
    { id: "init", role: "assistant", text: "Worker AI ready. I can prioritize tasks, explain alerts, or create new assignments." },
  ]);
  const [voicePulse, setVoicePulse] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [itemsScanned, setItemsScanned] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(initialAlerts.length);

  const selectedShelfId = useDashboardUiStore((state) => state.selectedShelfId);
  const setSelectedShelf = useDashboardUiStore((state) => state.setSelectedShelf);
  const mapZoom = useDashboardUiStore((state) => state.mapZoom);
  const setMapZoom = useDashboardUiStore((state) => state.setMapZoom);
  const assistantOpen = useDashboardUiStore((state) => state.workerAssistantOpen);
  const toggleAssistant = useDashboardUiStore((state) => state.toggleWorkerAssistant);
  const checkedInAt = useDashboardUiStore((state) => state.checkedInAt);
  const setCheckedInAt = useDashboardUiStore((state) => state.setCheckedInAt);
  const language = useLanguageStore((state) => state.language);
  const t = copy[language];
  const tabText = tabLabels[language];

  const selectedZone = shelfZones.find((zone) => zone.id === selectedShelfId) ?? null;
  const elapsedSeconds = checkedInAt ? Math.floor((Date.now() - checkedInAt) / 1000) : 0;
  const shiftProgress = checkedInAt ? Math.min(100, (elapsedSeconds / (8 * 3600)) * 100) : 0;

  const tasksQuery = useQuery({
    queryKey: ["worker", "tasks"],
    queryFn: async () => {
      await wait(420);
      return [...taskDb];
    },
  });

  const alertsQuery = useQuery({
    queryKey: ["worker", "alerts"],
    queryFn: async () => {
      await wait(320);
      return [...alertDb];
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await wait(500);
      taskDb = taskDb.filter((task) => task.id !== taskId);
      return taskId;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["worker", "tasks"] });
      const previous = queryClient.getQueryData<WorkerTask[]>(["worker", "tasks"]) ?? [];
      queryClient.setQueryData<WorkerTask[]>(["worker", "tasks"], previous.filter((task) => task.id !== taskId));
      setCompletedTasks((value) => value + 1);
      return { previous };
    },
    onError: (_error, _taskId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["worker", "tasks"], context.previous);
      }
    },
    onSuccess: () => {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.72 } });
      setToast("Well done! Shelf accuracy improved +2%");
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await wait(350);
      alertDb = alertDb.filter((alert) => alert.id !== alertId);
      return alertId;
    },
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: ["worker", "alerts"] });
      const previous = queryClient.getQueryData<LiveAlert[]>(["worker", "alerts"]) ?? [];
      queryClient.setQueryData<LiveAlert[]>(["worker", "alerts"], previous.filter((alert) => alert.id !== alertId));
      return { previous };
    },
    onError: (_error, _alertId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["worker", "alerts"], context.previous);
      }
    },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 720);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setNowLabel(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = subscribeToRealtimeAlerts((incoming) => {
      alertDb = [incoming, ...alertDb].slice(0, 24);
      queryClient.setQueryData<LiveAlert[]>(["worker", "alerts"], (current = []) => [incoming, ...current]);
      setUnreadAlerts((count) => count + 1);
      setToast(`New ${incoming.type} alert: ${incoming.title}`);
    });
    return cleanup;
  }, [queryClient]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const tasks = tasksQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  const aiConfidence = useMemo(() => {
    if (tasks.length === 0) return 99;
    return Math.round(tasks.reduce((sum, task) => sum + task.aiConfidence, 0) / tasks.length);
  }, [tasks]);

  if (!ready) {
    return (
      <div className="lumina-root min-h-screen p-4 text-slate-200 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="lumina-glass h-12 rounded-2xl lumina-skeleton" />
          <div className="lumina-glass h-28 rounded-3xl lumina-skeleton" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="lumina-glass h-64 rounded-3xl lumina-skeleton" />
            <div className="lumina-glass h-64 rounded-3xl lumina-skeleton" />
          </div>
          <div className="lumina-glass h-72 rounded-3xl lumina-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="lumina-root min-h-screen pb-28 text-slate-100">
      <CommandPalette />

      <header className="sticky top-0 z-30 border-b border-cyan-300/10 bg-slate-950/55 px-4 py-2.5 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs sm:text-sm">
          <div className="inline-flex items-center gap-2 font-medium text-cyan-100">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            {t.store}
          </div>
          <div className="hidden items-center gap-2 text-slate-300 md:flex">
            <span>{t.aiConfidence}</span>
            <div className="h-2 w-32 rounded-full bg-slate-700">
              <motion.div
                className="h-full rounded-full bg-cyan-300"
                animate={{ width: `${aiConfidence}%` }}
                transition={{ type: "spring", stiffness: 130, damping: 22 }}
              />
            </div>
            <span className="text-cyan-200">{aiConfidence}%</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <LanguageToggle />
            <span>{nowLabel}</span>
            <button
              onClick={() => {
                setAlertsOpen((value) => !value);
                setUnreadAlerts(0);
              }}
              className="relative rounded-full border border-cyan-300/20 bg-cyan-500/10 p-1.5"
            >
              <Bell className="h-4 w-4" />
              {unreadAlerts > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
            </button>
            <UserCircle2 className="h-5 w-5 text-cyan-200" />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 pt-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <article className="lumina-glass rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t.assignedTasks}</h2>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-100">
                {t.dragHint}
              </span>
            </div>

            <Reorder.Group
              axis="y"
              values={tasks}
              onReorder={(next) => {
                taskDb = [...next];
                queryClient.setQueryData(["worker", "tasks"], next);
              }}
              className="space-y-2"
            >
              {tasks.map((task) => (
                <Reorder.Item key={task.id} value={task}>
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 160 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 120) {
                        completeTaskMutation.mutate(task.id);
                      }
                    }}
                    whileHover={{ y: -1.5 }}
                    className="rounded-2xl border border-white/10 bg-slate-900/55 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-50">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-300">{task.shelf}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                      <span>{t.dueIn} {task.dueInMinutes}m</span>
                      <span>{task.aiConfidence}% AI confidence</span>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </article>

          <article className="lumina-glass rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t.shelfInspection}</h2>
              <button
                onClick={() => setInspectionOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-100"
              >
                <Camera className="h-3.5 w-3.5" />
                {t.scanShelf}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3 text-xs text-slate-300">
                <p className="mb-1 text-sm text-slate-100">{t.latestScan}</p>
                <p>{t.latestScanDesc}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3 text-xs text-slate-300">
                <p className="mb-1 text-sm text-slate-100">{t.modelStatus}</p>
                <p>{t.modelStatusDesc}</p>
              </div>
            </div>
          </article>

          <WorkerStoreMap
            zones={shelfZones}
            selectedId={selectedShelfId}
            zoom={mapZoom}
            language={language}
            onSelect={(id) => setSelectedShelf(id)}
            onZoom={setMapZoom}
          />
        </section>

        <section className="space-y-4">
          <article className="lumina-glass rounded-3xl p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">{t.misplaced}</h2>
            <div className="flex snap-x gap-3 overflow-x-auto pb-2">
              {misplacedItems.map((item) => (
                <div key={item.id} className="w-64 shrink-0 snap-start rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <img src={item.image} alt={item.name} className="h-28 w-full rounded-xl object-cover" />
                  <p className="mt-2 text-sm font-medium text-slate-100">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-300">{item.detectedLocation} → {item.correctLocation}</p>
                  <button
                    onClick={() => {
                      const newTask: WorkerTask = {
                        id: `task-${Date.now()}`,
                        title: `Move ${item.name}`,
                        shelf: item.correctLocation,
                        priority: item.severity === "critical" ? "critical" : item.severity === "medium" ? "high" : "medium",
                        dueInMinutes: 18,
                        aiConfidence: 93,
                      };
                      taskDb = [newTask, ...taskDb];
                      queryClient.setQueryData<WorkerTask[]>(["worker", "tasks"], (current = []) => [newTask, ...current]);
                      setToast(`Task created for ${item.name}`);
                    }}
                    className="mt-2 inline-flex items-center gap-1 rounded-full border border-violet-300/40 bg-violet-500/20 px-3 py-1 text-xs text-violet-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t.moveNow}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="lumina-glass rounded-3xl p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">{t.backInventory}</h2>
            <div className="grid grid-cols-2 gap-3">
              {inventoryItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">
                  <div className="flex items-center justify-between">
                    <InventoryRing value={item.stockPercent} />
                    <button className="rounded-full border border-emerald-300/40 bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-100">
                      {t.quickReorder}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-100">{item.name}</p>
                  <p className="text-[11px] text-slate-300">AI suggests {item.suggestedReorder} units</p>
                </div>
              ))}
            </div>
          </article>

          <article className="lumina-glass rounded-3xl p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">{t.attendance}</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (checkedInAt) {
                    setCheckedInAt(null);
                    setShowSummary(true);
                    return;
                  }
                  setCheckedInAt(Date.now());
                }}
                className={`relative flex h-28 w-28 items-center justify-center rounded-full border text-center text-xs font-semibold ${
                  checkedInAt
                    ? "border-red-300/60 bg-red-500/20 text-red-100"
                    : "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                }`}
              >
                {checkedInAt ? t.checkOut : t.checkIn}
              </button>
              <div className="flex-1">
                <p className="text-sm text-slate-100">{t.shiftTimer}</p>
                <p className="mt-1 text-2xl font-semibold text-cyan-100">{formatDuration(elapsedSeconds)}</p>
                <div className="mt-2 h-2 rounded-full bg-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-cyan-300"
                    animate={{ width: `${shiftProgress}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 22 }}
                  />
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>

      <nav className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-cyan-300/20 bg-slate-950/75 px-3 py-2 backdrop-blur-2xl">
        {workerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] transition ${
              activeTab === tab.id ? "bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_rgba(0,245,255,0.35)]" : "text-slate-400"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tabText[tab.id]}
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {alertsOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-cyan-300/15 bg-slate-950/90 p-4 backdrop-blur-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t.liveAlerts}</h3>
              <button onClick={() => setAlertsOpen(false)} className="rounded-full border border-white/20 px-2 py-1 text-xs text-slate-300">{t.close}</button>
            </div>
            <div className="space-y-2 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">
                  <p className="text-sm text-slate-100">{alert.title}</p>
                  <p className="mt-1 text-xs text-slate-300">{alert.message}</p>
                  <button
                    onClick={() => resolveAlertMutation.mutate(alert.id)}
                    className="mt-2 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-100"
                  >
                    {t.markResolved}
                  </button>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button
        drag
        dragMomentum={false}
        onClick={() => toggleAssistant()}
        className="fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-500/15 text-cyan-100 shadow-[0_0_26px_rgba(0,245,255,0.42)]"
      >
        <Bot className="h-7 w-7" />
      </motion.button>

      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="fixed bottom-24 right-4 z-50 h-[460px] w-[min(360px,calc(100%-24px))] rounded-3xl border border-cyan-300/20 bg-slate-950/85 p-3 backdrop-blur-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-cyan-100">{t.assistant}</p>
              <button onClick={() => toggleAssistant(false)} className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-slate-300">{t.close}</button>
            </div>
            <div className="h-[330px] space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/55 p-2">
              {assistantMessages.map((message) => (
                <div key={message.id} className={`rounded-xl px-2 py-1.5 text-xs ${message.role === "assistant" ? "bg-cyan-500/15 text-cyan-100" : "bg-slate-700/55 text-slate-100"}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {[
                "Restock shelf 4B?",
                "Review today's accuracy?",
                "Assign task to Rahul?",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setAssistantInput(chip)}
                  className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-slate-300"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form
              onSubmit={async (event: FormEvent) => {
                event.preventDefault();
                if (!assistantInput.trim()) return;
                
                const userText = assistantInput.trim();
                const nextUser = { id: `u-${Date.now()}`, role: "user" as const, text: userText };
                const currentMessages = [...assistantMessages, nextUser];
                setAssistantMessages((current) => [...current, nextUser]);
                setAssistantInput("");

                try {
                  const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      messages: currentMessages.map((m) => ({
                        role: m.role,
                        content: m.text,
                      })),
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || "Chat API failed");
                  }

                  const data = await response.json();
                  const assistantText = data.choices?.[0]?.message?.content || "I'm having trouble connecting to my retail brain right now.";

                  const nextAssistant = {
                    id: `a-${Date.now() + 1}`,
                    role: "assistant" as const,
                    text: assistantText,
                  };
                  setAssistantMessages((current) => [...current, nextAssistant]);
                } catch (error) {
                  console.error("Worker chat error:", error);
                  const errorAssistant = {
                    id: `a-${Date.now() + 1}`,
                    role: "assistant" as const,
                    text: "Sorry, I encountered an error. Please try again.",
                  };
                  setAssistantMessages((current) => [...current, errorAssistant]);
                }
              }}
              className="mt-2 flex items-center gap-2"
            >
              <input
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-900/65 px-3 py-2 text-sm text-white outline-none"
                placeholder={t.askAi}
              />
              <button
                type="button"
                onClick={() => setInspectionOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/40 bg-blue-500/15 text-blue-100"
                title="Scan Shelf"
              >
                <Camera className="h-4 w-4" />
              </button>
              <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-500/20 text-cyan-100">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inspectionOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
            onClick={() => setInspectionOpen(false)}
          >
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              className="w-full max-w-4xl rounded-3xl border border-cyan-300/20 bg-slate-950/85 p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t.shelfInspection}</h3>
                <button onClick={() => setInspectionOpen(false)} className="rounded-full border border-white/20 px-2 py-1 text-xs text-slate-300">{t.close}</button>
              </div>
              <div className="mt-4 grid gap-6 lg:grid-cols-1">
                <div className="space-y-4">
                  <ShelfScanner 
                    onScanComplete={(result) => {
                      if (result.success && result.data) {
                        setItemsScanned((prev) => prev + result.data.annotatedProductCount);
                        setInspectionComplete(true);
                      }
                    }} 
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      <AnimatePresence>
        {showSummary && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-cyan-300/20 bg-slate-950/88 p-5"
            >
              <h3 className="text-xl font-semibold text-white">{t.shiftSummary}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">{t.tasksCompleted}: {completedTasks}</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">{t.itemsScanned}: {itemsScanned}</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">{t.accuracyScore}: <span className="text-cyan-100">{Math.min(99, 84 + completedTasks * 2)}%</span></div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-3">{t.aiContribution}: 73%</div>
              </div>
              <div className="mt-3 rounded-2xl border border-violet-300/30 bg-violet-500/15 p-3 text-sm text-violet-100">
                {t.coachingTip}
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="mt-4 w-full rounded-2xl border border-cyan-300/40 bg-cyan-500/20 px-3 py-2 text-sm text-cyan-100"
              >
                {t.closeSummary}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-cyan-300/40 bg-slate-950/85 px-4 py-2 text-xs text-cyan-100"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
