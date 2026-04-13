"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Priority = "critical" | "high" | "normal";
export type AlertCategory = "critical" | "inventory" | "staff";

export interface WorkerTask {
  id: string;
  title: string;
  shelf: string;
  priority: Priority;
  dueInMinutes: number;
  confidence: number;
  completed: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  detail: string;
  category: AlertCategory;
  severity: "critical" | "warning" | "info";
  createdAt: number;
  resolved: boolean;
}

export interface ShelfZone {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  stock: number;
  health: number;
  tasksToday: number;
}

export interface MisplacedProduct {
  id: string;
  name: string;
  image: string;
  detectedAt: string;
  expectedAt: string;
  severity: "high" | "medium" | "low";
}

export interface InventoryItem {
  id: string;
  name: string;
  level: number;
  reorderSuggestion: number;
}

export interface WorkerPerformance {
  id: string;
  name: string;
  role: "picker" | "scanner" | "supervisor";
  score: number;
  active: boolean;
}

export interface StoreOption {
  id: string;
  name: string;
  flag: string;
}

interface LuminaState {
  workerTasks: WorkerTask[];
  alerts: AlertItem[];
  shelves: ShelfZone[];
  misplacedProducts: MisplacedProduct[];
  inventory: InventoryItem[];
  workerPerformance: WorkerPerformance[];
  stores: StoreOption[];
  activeStoreId: string;
  managerPanelOrder: string[];
  commandPaletteOpen: boolean;
  selectedShelfId: string | null;
  unreadAlerts: number;
  workerCheckedInAt: number | null;
  shiftDurationMinutes: number;
  assistantPos: { x: number; y: number };
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveStore: (storeId: string) => void;
  setSelectedShelf: (shelfId: string | null) => void;
  reorderWorkerTasks: (ids: string[]) => void;
  completeTask: (taskId: string) => void;
  createTaskFromMisplaced: (misplacedId: string) => void;
  resolveAlert: (alertId: string) => void;
  pushRealtimeAlert: (alert: Omit<AlertItem, "id" | "createdAt" | "resolved">) => void;
  markAlertsRead: () => void;
  quickReorder: (inventoryId: string) => void;
  setWorkerCheckedIn: (checkedIn: boolean) => void;
  setAssistantPos: (pos: { x: number; y: number }) => void;
  reorderManagerPanels: (ids: string[]) => void;
}

const INITIAL_TASKS: WorkerTask[] = [
  {
    id: "task-1",
    title: "Restock sparkling water bay",
    shelf: "Aisle 4B",
    priority: "critical",
    dueInMinutes: 18,
    confidence: 96,
    completed: false,
  },
  {
    id: "task-2",
    title: "Verify dairy planogram",
    shelf: "Aisle 2D",
    priority: "high",
    dueInMinutes: 34,
    confidence: 91,
    completed: false,
  },
  {
    id: "task-3",
    title: "Reconcile damaged SKU labels",
    shelf: "Aisle 6A",
    priority: "normal",
    dueInMinutes: 46,
    confidence: 85,
    completed: false,
  },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alert-1",
    title: "Critical stockout predicted",
    detail: "Energy drinks shelf 4B likely to hit zero in 21 minutes.",
    category: "critical",
    severity: "critical",
    createdAt: Date.now() - 1000 * 60 * 2,
    resolved: false,
  },
  {
    id: "alert-2",
    title: "Temperature drift detected",
    detail: "Chiller section 2 reports +2.1C above threshold.",
    category: "inventory",
    severity: "warning",
    createdAt: Date.now() - 1000 * 60 * 11,
    resolved: false,
  },
  {
    id: "alert-3",
    title: "Staff coverage gap",
    detail: "Aisle 8 needs one additional worker for peak window.",
    category: "staff",
    severity: "info",
    createdAt: Date.now() - 1000 * 60 * 17,
    resolved: false,
  },
];

const INITIAL_SHELVES: ShelfZone[] = [
  { id: "4B", name: "4B", x: 18, y: 18, w: 14, h: 14, stock: 32, health: 71, tasksToday: 4 },
  { id: "2D", name: "2D", x: 36, y: 18, w: 14, h: 14, stock: 64, health: 89, tasksToday: 3 },
  { id: "6A", name: "6A", x: 54, y: 18, w: 14, h: 14, stock: 78, health: 94, tasksToday: 2 },
  { id: "5C", name: "5C", x: 18, y: 38, w: 14, h: 14, stock: 41, health: 76, tasksToday: 5 },
  { id: "3A", name: "3A", x: 36, y: 38, w: 14, h: 14, stock: 88, health: 97, tasksToday: 1 },
  { id: "1F", name: "1F", x: 54, y: 38, w: 14, h: 14, stock: 27, health: 63, tasksToday: 6 },
];

const INITIAL_PRODUCTS: MisplacedProduct[] = [
  {
    id: "mis-1",
    name: "Protein Shake 500ml",
    image:
      "https://images.unsplash.com/photo-1595872018818-97555653a011?auto=format&fit=crop&w=400&q=80",
    detectedAt: "Aisle 6A",
    expectedAt: "Aisle 2B",
    severity: "high",
  },
  {
    id: "mis-2",
    name: "Granola Mix",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
    detectedAt: "Aisle 5C",
    expectedAt: "Aisle 5A",
    severity: "medium",
  },
  {
    id: "mis-3",
    name: "Baby Lotion",
    image:
      "https://images.unsplash.com/photo-1600181950244-a95f8fe0d4cf?auto=format&fit=crop&w=400&q=80",
    detectedAt: "Aisle 3D",
    expectedAt: "Aisle 7B",
    severity: "low",
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Cold Brew 250ml", level: 19, reorderSuggestion: 48 },
  { id: "inv-2", name: "Organic Oats", level: 42, reorderSuggestion: 33 },
  { id: "inv-3", name: "Hydration Gel", level: 12, reorderSuggestion: 68 },
  { id: "inv-4", name: "Frozen Berries", level: 35, reorderSuggestion: 39 },
];

const INITIAL_WORKERS: WorkerPerformance[] = [
  { id: "w-1", name: "Rahul", role: "scanner", score: 94, active: true },
  { id: "w-2", name: "Meera", role: "picker", score: 89, active: true },
  { id: "w-3", name: "Anaya", role: "supervisor", score: 97, active: false },
  { id: "w-4", name: "Daniel", role: "picker", score: 82, active: true },
];

const INITIAL_STORES: StoreOption[] = [
  { id: "blr", name: "Bengaluru Central", flag: "IN" },
  { id: "sfo", name: "San Francisco North", flag: "US" },
  { id: "ldn", name: "London Riverside", flag: "GB" },
];

const PANEL_ORDER = [
  "health",
  "alerts",
  "revenue",
  "workers",
  "analytics",
  "planogram",
  "comparison",
  "multistore",
];

export const useLuminaStore = create<LuminaState>()(
  persist(
    (set, get) => ({
      workerTasks: INITIAL_TASKS,
      alerts: INITIAL_ALERTS,
      shelves: INITIAL_SHELVES,
      misplacedProducts: INITIAL_PRODUCTS,
      inventory: INITIAL_INVENTORY,
      workerPerformance: INITIAL_WORKERS,
      stores: INITIAL_STORES,
      activeStoreId: "blr",
      managerPanelOrder: PANEL_ORDER,
      commandPaletteOpen: false,
      selectedShelfId: "4B",
      unreadAlerts: INITIAL_ALERTS.length,
      workerCheckedInAt: null,
      shiftDurationMinutes: 480,
      assistantPos: { x: 0, y: 0 },
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setActiveStore: (storeId) => set({ activeStoreId: storeId }),
      setSelectedShelf: (shelfId) => set({ selectedShelfId: shelfId }),
      reorderWorkerTasks: (ids) =>
        set((state) => ({
          workerTasks: ids
            .map((id) => state.workerTasks.find((task) => task.id === id))
            .filter((task): task is WorkerTask => Boolean(task)),
        })),
      completeTask: (taskId) =>
        set((state) => ({
          workerTasks: state.workerTasks.map((task) =>
            task.id === taskId ? { ...task, completed: true } : task,
          ),
        })),
      createTaskFromMisplaced: (misplacedId) =>
        set((state) => {
          const misplaced = state.misplacedProducts.find((item) => item.id === misplacedId);
          if (!misplaced) return state;
          return {
            workerTasks: [
              {
                id: `task-${Date.now()}`,
                title: `Move ${misplaced.name}`,
                shelf: misplaced.detectedAt,
                priority: misplaced.severity === "high" ? "critical" : misplaced.severity === "medium" ? "high" : "normal",
                dueInMinutes: 25,
                confidence: 90,
                completed: false,
              },
              ...state.workerTasks,
            ],
          };
        }),
      resolveAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, resolved: true } : alert,
          ),
        })),
      pushRealtimeAlert: (alert) =>
        set((state) => ({
          alerts: [
            {
              id: `alert-${Date.now()}`,
              createdAt: Date.now(),
              resolved: false,
              ...alert,
            },
            ...state.alerts,
          ],
          unreadAlerts: state.unreadAlerts + 1,
        })),
      markAlertsRead: () => set({ unreadAlerts: 0 }),
      quickReorder: (inventoryId) =>
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === inventoryId
              ? { ...item, level: Math.min(100, item.level + 24) }
              : item,
          ),
        })),
      setWorkerCheckedIn: (checkedIn) =>
        set(() => ({
          workerCheckedInAt: checkedIn ? Date.now() : null,
        })),
      setAssistantPos: (pos) => set({ assistantPos: pos }),
      reorderManagerPanels: (ids) => set({ managerPanelOrder: ids }),
    }),
    {
      name: "lumina-state-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workerTasks: state.workerTasks,
        alerts: state.alerts,
        activeStoreId: state.activeStoreId,
        managerPanelOrder: state.managerPanelOrder,
        workerCheckedInAt: state.workerCheckedInAt,
      }),
      merge: (persisted, current) => {
        const cast = persisted as Partial<LuminaState>;
        return {
          ...current,
          ...cast,
        };
      },
    },
  ),
);

export function getPriorityTone(priority: Priority) {
  if (priority === "critical") return "text-rose-300 border-rose-400/50 bg-rose-500/15";
  if (priority === "high") return "text-amber-300 border-amber-400/50 bg-amber-500/15";
  return "text-emerald-300 border-emerald-400/50 bg-emerald-500/15";
}
