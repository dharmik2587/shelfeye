"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type StoreId = "A" | "B" | "C";
export type AppSection = "dashboard" | "planogram" | "sku" | "alerts" | "assistant" | "settings";
export type Persona = "manager" | "worker" | "analyst";
export type CursorMode = "default" | "target" | "hologram" | "pulse";

export interface KpiSet {
  revenueRecovered: number;
  activeStockouts: number;
  compliance: number;
  wmape: number;
  lostRevenueRisk: number;
  replenishmentEfficiency: number;
  co2Saved: number;
  latencyMs: number;
  modelConfidence: number;
}

export interface HeatCell {
  id: string;
  x: number;
  y: number;
  aisle: string;
  intensity: number;
  stockoutProbability: number;
  instruction: string;
}

export interface ShelfState {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  risk: number;
  fill: number;
}

export interface TrendPoint {
  label: string;
  value: number;
  forecast: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface TimelineFrame {
  hour: number;
  label: string;
  severity: number;
  event: string;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info";
  impact: number;
  etaMinutes: number;
  suggestion: string;
  createdAt: number;
}

export interface SkuRow {
  id: string;
  name: string;
  category: string;
  riskScore: number;
  demandVelocity: number;
  aiInsight: string;
  confidence: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  tasksCompleted: number;
  accuracy: number;
  rating: number;
  sales: number;
  attendance: number;
  remarks: string;
}

export interface StoreDataset {
  id: StoreId;
  name: string;
  kpis: KpiSet;
  heatmap: HeatCell[];
  shelves: ShelfState[];
  trends: TrendPoint[];
  timeline: TimelineFrame[];
  alerts: AlertItem[];
  skuRows: SkuRow[];
  planogramExpected: string[][];
  planogramDetected: string[][];
  staff: StaffMember[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
}

interface NewSkuInput {
  name: string;
  category: string;
  velocity: number;
}

interface ShelfEyeState {
  stores: Record<StoreId, StoreDataset>;
  currentStore: StoreId;
  section: AppSection;
  cursorMode: CursorMode;
  selectedHeatCell: HeatCell | null;
  selectedShelfId: string | null;
  selectedTimelineHour: number;
  widgetOrder: string[];
  persona: Persona;
  chatOpen: boolean;
  voiceListening: boolean;
  chatMessages: ChatMessage[];
  notificationsEnabled: boolean;
  shortcutsEnabled: boolean;
  presenceEnabled: boolean;
  setSection: (section: AppSection) => void;
  switchStore: (store: StoreId) => void;
  refreshLiveData: () => void;
  setCursorMode: (mode: CursorMode) => void;
  selectHeatCell: (cell: HeatCell | null) => void;
  selectShelf: (shelfId: string | null) => void;
  setTimelineHour: (hour: number) => void;
  setWidgetOrder: (order: string[]) => void;
  setPersona: (persona: Persona) => void;
  toggleChat: (open?: boolean) => void;
  setVoiceListening: (listening: boolean) => void;
  sendChatMessage: (input: string) => void;
  simulateAlert: () => void;
  decrementAlertTimers: () => void;
  addSku: (input: NewSkuInput) => void;
  updatePlanogramDetected: (row: number, col: number, value: string) => void;
  setNotificationPreference: (enabled: boolean) => void;
  setShortcutPreference: (enabled: boolean) => void;
  setPresencePreference: (enabled: boolean) => void;
}

const STORE_NAMES: Record<StoreId, string> = {
  A: "Store A - Downtown",
  B: "Store B - Airport",
  C: "Store C - Suburban",
};

const PRODUCT_POOL = [
  "Sparkling Water",
  "Protein Bars",
  "Cold Brew",
  "Organic Milk",
  "Trail Mix",
  "Kombucha",
  "Fruit Cups",
  "Yogurt",
  "Instant Noodles",
  "Granola",
];

const CATEGORY_POOL = ["Beverages", "Snacks", "Dairy", "Pantry", "Fresh"];

const WIDGETS = ["kpis", "heatmap", "twin", "timeline", "trends", "decision"] as const;

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pickSeverity(value: number): "critical" | "warning" | "info" {
  if (value > 74) return "critical";
  if (value > 48) return "warning";
  return "info";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelveHour}:00 ${suffix}`;
}

function buildStoreData(id: StoreId): StoreDataset {
  const seed = id === "A" ? 31 : id === "B" ? 73 : 109;
  const rand = seededRandom(seed);

  const heatmap: HeatCell[] = Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    // Sequential aisle numbering: 1-10 (each row is an aisle)
    const aisleNum = y + 1;
    const aisle = `Aisle ${aisleNum}`;
    
    const instructions = [
      "Check top shelf for stockout",
      "Verify price tag alignment",
      "Restock beverages from back storage",
      "Clean shelf surfaces",
      "Update promotional signage",
      "Face products to front",
      "Remove expired items",
      "Scan barcode for inventory sync",
      "Check bottom shelf for spills",
      "Rotate stock using FIFO method",
      "Optimize product placement for eye-level",
      "Verify shelf-edge labels",
    ];
    
    const baseline = id === "B" ? 12 : id === "C" ? -4 : 0;
    const intensity = clamp(Math.round(rand() * 100 + baseline), 4, 98);
    return {
      id: `${id}-heat-${index}`,
      x,
      y,
      aisle,
      intensity,
      stockoutProbability: clamp(Math.round(intensity * 0.84), 5, 99),
      instruction: instructions[Math.floor(rand() * instructions.length)],
    };
  });

  const shelves: ShelfState[] = Array.from({ length: 12 }, (_, index) => {
    const lane = index % 4;
    const row = Math.floor(index / 4);
    const risk = clamp(Math.round(rand() * 100 + (id === "B" ? 8 : 0)), 1, 99);
    return {
      id: `${id}-S${index + 1}`,
      label: `Shelf ${index + 1}`,
      x: lane * 2 - 3,
      y: row * 1.1 + 0.6,
      z: row * 1.9 - 2.2,
      risk,
      fill: clamp(Math.round(100 - risk + rand() * 18), 6, 98),
    };
  });

  const trends: TrendPoint[] = Array.from({ length: 7 }, (_, index) => {
    const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index];
    const base = id === "B" ? 48 : id === "C" ? 36 : 41;
    const forecast = clamp(Math.round(base + rand() * 26 + index * 2), 18, 97);
    const actual = clamp(Math.round(forecast + (rand() - 0.4) * 20), 9, 99);
    const spread = Math.max(4, Math.round(rand() * 9 + 3));
    return {
      label: day,
      value: actual,
      forecast,
      confidenceLow: clamp(forecast - spread, 1, 100),
      confidenceHigh: clamp(forecast + spread, 1, 100),
    };
  });

  const timeline: TimelineFrame[] = Array.from({ length: 24 }, (_, hour) => {
    const severity = clamp(Math.round(rand() * 100 + (hour > 16 ? 8 : 0)), 5, 99);
    const eventPool = [
      "Demand spike in beverages",
      "Shelf replenishment completed",
      "Planogram mismatch detected",
      "Cold chain alert resolved",
      "Promo lift exceeded forecast",
      "Restock delay identified",
    ];
    return {
      hour,
      label: formatHourLabel(hour),
      severity,
      event: eventPool[Math.floor(rand() * eventPool.length)],
    };
  });

  const alerts: AlertItem[] = Array.from({ length: 8 }, (_, index) => {
    const impact = clamp(Math.round(rand() * 1400 + 220), 80, 2100);
    const severity = pickSeverity(impact / 20);
    return {
      id: `${id}-alert-${index}`,
      title: severity === "critical" ? "Critical shelf drift" : "Upcoming stockout risk",
      severity,
      impact,
      etaMinutes: clamp(Math.round(rand() * 80 + 15), 6, 120),
      suggestion:
        severity === "critical"
          ? "Dispatch floor worker and trigger auto-replenishment."
          : "Rebalance stock from adjacent aisle and monitor sell-through.",
      createdAt: Date.now() - Math.round(rand() * 1_800_000),
    };
  });

  const skuRows: SkuRow[] = Array.from({ length: 16 }, (_, index) => {
    const riskScore = clamp(Math.round(rand() * 100), 3, 97);
    return {
      id: `${id}-sku-${index}`,
      name: PRODUCT_POOL[index % PRODUCT_POOL.length],
      category: CATEGORY_POOL[index % CATEGORY_POOL.length],
      riskScore,
      demandVelocity: clamp(Math.round(rand() * 80 + 18), 8, 110),
      aiInsight:
        riskScore > 70
          ? "High cannibalization during evening rush."
          : riskScore > 45
            ? "Moderate risk from promo overlap."
            : "Healthy movement and stable margin.",
      confidence: clamp(Math.round(rand() * 20 + 78), 72, 99),
    };
  });

  const planogramExpected: string[][] = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => PRODUCT_POOL[(row * 6 + col) % PRODUCT_POOL.length]),
  );
  const planogramDetected = planogramExpected.map((row, rowIndex) =>
    row.map((item, colIndex) => ((rowIndex + colIndex + seed) % 7 === 0 ? PRODUCT_POOL[(colIndex + 3) % PRODUCT_POOL.length] : item)),
  );

  const averageRisk = heatmap.reduce((total, cell) => total + cell.intensity, 0) / heatmap.length;
  const revenueRecoveredBase = id === "B" ? 268_420 : id === "C" ? 205_880 : 244_130;
  const stockoutCount = heatmap.filter((cell) => cell.intensity > 72).length;

  const staff: StaffMember[] = [
    { id: "S001", name: "Rahul Shah", role: "Cashier", shift: "Morning", tasksCompleted: 120, accuracy: 96, rating: 4.5, sales: 45000, attendance: 98, remarks: "Very efficient" },
    { id: "S002", name: "Priya Patel", role: "Store Assistant", shift: "Evening", tasksCompleted: 95, accuracy: 92, rating: 4.2, sales: 30000, attendance: 95, remarks: "Good performance" },
    { id: "S003", name: "Amit Verma", role: "Inventory Mgr", shift: "Morning", tasksCompleted: 80, accuracy: 97, rating: 4.6, sales: 0, attendance: 99, remarks: "Highly accurate" },
    { id: "S004", name: "Neha Joshi", role: "Cashier", shift: "Night", tasksCompleted: 110, accuracy: 94, rating: 4.3, sales: 40000, attendance: 97, remarks: "Consistent" },
    { id: "S005", name: "Karan Mehta", role: "Store Assistant", shift: "Morning", tasksCompleted: 85, accuracy: 90, rating: 4.0, sales: 25000, attendance: 93, remarks: "Needs improvement" },
    { id: "S006", name: "Sneha Iyer", role: "Supervisor", shift: "Evening", tasksCompleted: 70, accuracy: 98, rating: 4.7, sales: 50000, attendance: 100, remarks: "Excellent leader" },
    { id: "S007", name: "Rohan Das", role: "Delivery Staff", shift: "Night", tasksCompleted: 60, accuracy: 91, rating: 4.1, sales: 20000, attendance: 92, remarks: "Reliable" },
    { id: "S008", name: "Anjali Nair", role: "Cashier", shift: "Morning", tasksCompleted: 130, accuracy: 95, rating: 4.4, sales: 48000, attendance: 96, remarks: "Fast worker" },
    { id: "S009", name: "Vikram Singh", role: "Store Assistant", shift: "Evening", tasksCompleted: 90, accuracy: 93, rating: 4.2, sales: 28000, attendance: 94, remarks: "Stable" },
    { id: "S010", name: "Pooja Gupta", role: "Inventory Mgr", shift: "Night", tasksCompleted: 75, accuracy: 96, rating: 4.5, sales: 0, attendance: 98, remarks: "Detail-oriented" },
  ];

  return {
    id,
    name: STORE_NAMES[id],
    kpis: {
      revenueRecovered: revenueRecoveredBase,
      activeStockouts: stockoutCount,
      compliance: clamp(Math.round(100 - averageRisk * 0.24), 78, 99),
      wmape: clamp(Math.round(11 + rand() * 8), 7, 22),
      lostRevenueRisk: clamp(Math.round(averageRisk * 920), 18000, 98000),
      replenishmentEfficiency: clamp(Math.round(72 + rand() * 22), 64, 98),
      co2Saved: clamp(Math.round(420 + rand() * 240), 280, 760),
      latencyMs: clamp(Math.round(112 + rand() * 68), 88, 220),
      modelConfidence: clamp(Math.round(84 + rand() * 12), 74, 99),
    },
    heatmap,
    shelves,
    trends,
    timeline,
    alerts,
    skuRows,
    planogramExpected,
    planogramDetected,
    staff,
  };
}

function jitterStoreData(dataset: StoreDataset): StoreDataset {
  const random = seededRandom(Date.now() + dataset.id.charCodeAt(0));
  const heatmap = dataset.heatmap.map((cell) => {
    const delta = (random() - 0.5) * 14;
    const nextIntensity = clamp(Math.round(cell.intensity + delta), 2, 99);
    return {
      ...cell,
      intensity: nextIntensity,
      stockoutProbability: clamp(Math.round(nextIntensity * 0.85), 5, 99),
    };
  });
  const highRisk = heatmap.filter((cell) => cell.intensity > 70).length;

  const shelves = dataset.shelves.map((shelf) => {
    const risk = clamp(Math.round(shelf.risk + (random() - 0.5) * 14), 2, 99);
    return {
      ...shelf,
      risk,
      fill: clamp(Math.round(100 - risk + random() * 14), 4, 98),
    };
  });

  const trends = dataset.trends.map((point) => {
    const forecast = clamp(Math.round(point.forecast + (random() - 0.5) * 9), 8, 99);
    const actual = clamp(Math.round(point.value + (random() - 0.5) * 10), 7, 99);
    const spread = clamp(Math.round(6 + random() * 6), 3, 15);
    return {
      ...point,
      forecast,
      value: actual,
      confidenceLow: clamp(forecast - spread, 2, 100),
      confidenceHigh: clamp(forecast + spread, 2, 100),
    };
  });

  const timeline = dataset.timeline.map((frame) => ({
    ...frame,
    severity: clamp(Math.round(frame.severity + (random() - 0.5) * 14), 4, 99),
  }));

  const alerts = dataset.alerts.map((alert) => ({
    ...alert,
    etaMinutes: clamp(alert.etaMinutes - 1, 0, 180),
    impact: clamp(Math.round(alert.impact + (random() - 0.55) * 120), 40, 2400),
  }));

  const kpis = {
    revenueRecovered: clamp(Math.round(dataset.kpis.revenueRecovered + (random() - 0.42) * 6600), 120000, 420000),
    activeStockouts: highRisk,
    compliance: clamp(Math.round(100 - highRisk * 0.23), 68, 100),
    wmape: clamp(Math.round(dataset.kpis.wmape + (random() - 0.5) * 2.2), 7, 24),
    lostRevenueRisk: clamp(Math.round(highRisk * 1040 + random() * 20000), 12000, 120000),
    replenishmentEfficiency: clamp(Math.round(dataset.kpis.replenishmentEfficiency + (random() - 0.46) * 4.2), 58, 99),
    co2Saved: clamp(Math.round(dataset.kpis.co2Saved + (random() - 0.4) * 18), 180, 920),
    latencyMs: clamp(Math.round(96 + random() * 120), 80, 260),
    modelConfidence: clamp(Math.round(dataset.kpis.modelConfidence + (random() - 0.45) * 2.5), 70, 99),
  };

  return {
    ...dataset,
    kpis,
    heatmap,
    shelves,
    trends,
    timeline,
    alerts,
  };
}

const initialStores: Record<StoreId, StoreDataset> = {
  A: buildStoreData("A"),
  B: buildStoreData("B"),
  C: buildStoreData("C"),
};

export const useShelfEyeStore = create<ShelfEyeState>()(
  persist(
    (set, get) => ({
      stores: initialStores,
      currentStore: "A",
      section: "dashboard",
      cursorMode: "default",
      selectedHeatCell: null,
      selectedShelfId: "A-S1",
      selectedTimelineHour: new Date().getHours(),
      widgetOrder: [...WIDGETS],
      persona: "manager",
      chatOpen: false,
      voiceListening: false,
      chatMessages: [
        {
          id: "seed-assistant",
          role: "assistant",
          text: "I am monitoring your live store data. Ask for stockout risk, forecast, or next-best action.",
          createdAt: Date.now(),
        },
      ],
      notificationsEnabled: true,
      shortcutsEnabled: true,
      presenceEnabled: true,
      setSection: (section) => set({ section }),
      switchStore: (store) =>
        set(() => ({
          currentStore: store,
          selectedHeatCell: null,
          selectedShelfId: `${store}-S1`,
        })),
      refreshLiveData: () =>
        set((state) => {
          const refreshed = jitterStoreData(state.stores[state.currentStore]);
          return {
            stores: {
              ...state.stores,
              [state.currentStore]: refreshed,
            },
          };
        }),
      setCursorMode: (mode) => set({ cursorMode: mode }),
      selectHeatCell: (cell) => set({ selectedHeatCell: cell }),
      selectShelf: (shelfId) => set({ selectedShelfId: shelfId }),
      setTimelineHour: (hour) => set({ selectedTimelineHour: hour }),
      setWidgetOrder: (order) => set({ widgetOrder: order }),
      setPersona: (persona) => set({ persona }),
      toggleChat: (open) => set((state) => ({ chatOpen: open ?? !state.chatOpen })),
      setVoiceListening: (listening) => set({ voiceListening: listening }),
      sendChatMessage: async (input) => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          text: input.trim(),
          createdAt: Date.now(),
        };

        const currentMessages = [...get().chatMessages, userMsg];

        set({
          chatMessages: currentMessages,
        });

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

          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: assistantText,
            createdAt: Date.now(),
          };

          set((state) => ({
            chatMessages: [...state.chatMessages, assistantMsg],
          }));
        } catch (error) {
          console.error("Chat error:", error);
          const errorMessage = error instanceof Error ? error.message : "Sorry, I encountered an error while processing your request. Please try again later.";
          const errorMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            role: "assistant",
            text: errorMessage,
            createdAt: Date.now(),
          };
          set((state) => ({
            chatMessages: [...state.chatMessages, errorMsg],
          }));
        }
      },
      simulateAlert: () =>
        set((state) => {
          const dataset = state.stores[state.currentStore];
          const severityList: AlertItem["severity"][] = ["critical", "warning", "info"];
          const severity = severityList[Math.floor(Math.random() * severityList.length)];
          const newAlert: AlertItem = {
            id: `${state.currentStore}-alert-${Date.now()}`,
            title:
              severity === "critical"
                ? "Immediate shelf outage risk"
                : severity === "warning"
                  ? "Forecast divergence detected"
                  : "Minor replenishment lag",
            severity,
            impact: clamp(Math.round(260 + Math.random() * 1800), 120, 2400),
            etaMinutes: clamp(Math.round(10 + Math.random() * 95), 4, 110),
            suggestion:
              severity === "critical"
                ? "Trigger worker dispatch and lock promo discount."
                : "Open AI decision panel for next recommended action.",
            createdAt: Date.now(),
          };
          return {
            stores: {
              ...state.stores,
              [state.currentStore]: {
                ...dataset,
                alerts: [newAlert, ...dataset.alerts].slice(0, 16),
              },
            },
          };
        }),
      decrementAlertTimers: () =>
        set((state) => {
          const dataset = state.stores[state.currentStore];
          return {
            stores: {
              ...state.stores,
              [state.currentStore]: {
                ...dataset,
                alerts: dataset.alerts.map((alert) => ({
                  ...alert,
                  etaMinutes: clamp(alert.etaMinutes - 1, 0, 300),
                })),
              },
            },
          };
        }),
      addSku: (input) =>
        set((state) => {
          const dataset = state.stores[state.currentStore];
          const riskScore = clamp(Math.round(40 + Math.random() * 55), 12, 98);
          const newRow: SkuRow = {
            id: `${state.currentStore}-sku-${Date.now()}`,
            name: input.name,
            category: input.category,
            riskScore,
            demandVelocity: clamp(input.velocity, 5, 130),
            aiInsight:
              riskScore > 70
                ? "AI flags near-term stockout; replenish within 8 hours."
                : "Healthy launch trajectory with moderate promo sensitivity.",
            confidence: clamp(Math.round(78 + Math.random() * 18), 70, 99),
          };
          return {
            stores: {
              ...state.stores,
              [state.currentStore]: {
                ...dataset,
                skuRows: [newRow, ...dataset.skuRows],
              },
            },
          };
        }),
      updatePlanogramDetected: (row, col, value) =>
        set((state) => {
          const dataset = state.stores[state.currentStore];
          const nextDetected = dataset.planogramDetected.map((rowItems) => [...rowItems]);
          if (!nextDetected[row] || typeof nextDetected[row][col] === "undefined") {
            return state;
          }
          nextDetected[row][col] = value;
          return {
            stores: {
              ...state.stores,
              [state.currentStore]: {
                ...dataset,
                planogramDetected: nextDetected,
              },
            },
          };
        }),
      setNotificationPreference: (enabled) => set({ notificationsEnabled: enabled }),
      setShortcutPreference: (enabled) => set({ shortcutsEnabled: enabled }),
      setPresencePreference: (enabled) => set({ presenceEnabled: enabled }),
    }),
    {
      name: "shelfeye-persist-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStore: state.currentStore,
        section: state.section,
        widgetOrder: state.widgetOrder,
        persona: state.persona,
        notificationsEnabled: state.notificationsEnabled,
        shortcutsEnabled: state.shortcutsEnabled,
        presenceEnabled: state.presenceEnabled,
      }),
      merge: (persistedState, currentState) => {
        const cast = persistedState as Partial<ShelfEyeState>;
        return {
          ...currentState,
          ...cast,
        };
      },
    },
  ),
);

export function useCurrentStoreData() {
  return useShelfEyeStore((state) => state.stores[state.currentStore]);
}
