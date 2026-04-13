import { create } from "zustand";

type HealthState = "healthy" | "warning" | "critical";

export interface Shelf {
  id: string;
  name: string;
  aisle: number;
  stockLevel: number;
  revenue: number;
  dwell: number;
  health: HealthState;
  alert?: string;
  position: [number, number, number];
}

export interface EchoAlert {
  id: string;
  title: string;
  severity: "amber" | "rose";
  shelfId: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  shelfId?: string;
  priority: "low" | "medium" | "high";
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
}

interface EchoEngineState {
  shelves: Shelf[];
  alerts: EchoAlert[];
  tasks: Task[];
  selectedShelfId?: string;
  timeline: number;
  activeSector: "dashboard" | "echo-canvas" | "analytics" | "tasks" | "settings";
  chatOpen: boolean;
  messages: ChatMessage[];
  setActiveSector: (sector: EchoEngineState["activeSector"]) => void;
  setSelectedShelf: (shelfId?: string) => void;
  setTimeline: (value: number) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleChat: () => void;
  addMessage: (message: ChatMessage) => void;
  randomPulse: () => void;
}

const now = new Date();

const baseShelves: Shelf[] = Array.from({ length: 24 }, (_, idx) => {
  const aisle = Math.floor(idx / 6) + 1;
  const row = idx % 6;
  const stockLevel = Math.max(8, 100 - idx * 3);
  const revenue = 1200 + Math.round(Math.sin(idx * 0.7) * 320 + idx * 56 + 500);

  return {
    id: `shelf-${idx + 1}`,
    name: `Shelf ${idx + 1}`,
    aisle,
    stockLevel,
    revenue,
    dwell: 40 + (idx % 5) * 12,
    health: stockLevel > 45 ? "healthy" : stockLevel > 25 ? "warning" : "critical",
    alert: stockLevel < 25 ? "Potential stockout in 3h" : undefined,
    position: [((row % 3) - 1) * 3.2, 0.7, (Math.floor(row / 3) - 0.5) * 4.8 + aisle * 2.4],
  };
});

export const useEchoEngineStore = create<EchoEngineState>((set) => ({
  shelves: baseShelves,
  alerts: [
    {
      id: "a-1",
      title: "Aisle 2 compliance drift",
      severity: "amber",
      shelfId: "shelf-8",
      timestamp: now.toISOString(),
    },
    {
      id: "a-2",
      title: "Shelf 19 likely stockout",
      severity: "rose",
      shelfId: "shelf-19",
      timestamp: now.toISOString(),
    },
  ],
  tasks: [
    { id: "t-1", title: "Replan chips endcap", status: "in-progress", shelfId: "shelf-8", priority: "high" },
    { id: "t-2", title: "Audit promo signage", status: "todo", shelfId: "shelf-3", priority: "medium" },
    { id: "t-3", title: "Refill energy drinks", status: "todo", shelfId: "shelf-19", priority: "high" },
  ],
  selectedShelfId: undefined,
  timeline: 50,
  activeSector: "dashboard",
  chatOpen: false,
  messages: [
    {
      id: "m-1",
      role: "assistant",
      content: "Echo online. Store pulse is stable at 98.4% sync. Want me to surface top risk zones?",
      createdAt: now.toISOString(),
    },
  ],
  setActiveSector: (activeSector) => set({ activeSector }),
  setSelectedShelf: (selectedShelfId) => set({ selectedShelfId }),
  setTimeline: (timeline) => set({ timeline }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    })),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  randomPulse: () =>
    set((state) => ({
      shelves: state.shelves.map((shelf, idx) => {
        const drift = Math.sin(Date.now() / 1000 + idx) * 1.5;
        const stockLevel = Math.max(5, Math.min(100, shelf.stockLevel + drift));
        return {
          ...shelf,
          stockLevel,
          health: stockLevel > 45 ? "healthy" : stockLevel > 25 ? "warning" : "critical",
          revenue: Math.max(500, shelf.revenue + drift * 24),
        };
      }),
    })),
}));
