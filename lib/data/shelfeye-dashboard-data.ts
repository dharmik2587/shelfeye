export type Priority = "critical" | "high" | "medium";

export interface WorkerTask {
  id: string;
  title: string;
  shelf: string;
  priority: Priority;
  dueInMinutes: number;
  aiConfidence: number;
}

export interface LiveAlert {
  id: string;
  title: string;
  message: string;
  type: "critical" | "inventory" | "staff";
  createdAt: number;
  resolved: boolean;
}

export interface ShelfZone {
  id: string;
  label: string;
  stock: number;
  recentTasks: number;
  aiInsight: string;
  x: number;
  y: number;
}

export interface MisplacedItem {
  id: string;
  name: string;
  image: string;
  detectedLocation: string;
  correctLocation: string;
  severity: "low" | "medium" | "critical";
}

export interface InventoryItem {
  id: string;
  name: string;
  stockPercent: number;
  suggestedReorder: number;
}

export interface WorkerPerformance {
  id: string;
  name: string;
  score: number;
  shiftStatus: "on-shift" | "break" | "off-shift";
  role: "worker" | "senior";
}

export const initialWorkerTasks: WorkerTask[] = [
  { id: "task-1", title: "Refill beverages facing", shelf: "Aisle 4B", priority: "critical", dueInMinutes: 12, aiConfidence: 96 },
  { id: "task-2", title: "Fix planogram mismatch", shelf: "Aisle 2A", priority: "high", dueInMinutes: 26, aiConfidence: 91 },
  { id: "task-3", title: "Audit damaged cans", shelf: "Aisle 6D", priority: "medium", dueInMinutes: 48, aiConfidence: 86 },
  { id: "task-4", title: "Recount promo shelf", shelf: "Aisle 1C", priority: "high", dueInMinutes: 34, aiConfidence: 88 },
];

export const initialAlerts: LiveAlert[] = [
  { id: "alert-1", title: "Critical stockout risk", message: "Shelf 4B projected to empty in 11 minutes.", type: "critical", createdAt: Date.now() - 2 * 60_000, resolved: false },
  { id: "alert-2", title: "Inventory mismatch", message: "System count differs by 7 units in aisle 2A.", type: "inventory", createdAt: Date.now() - 8 * 60_000, resolved: false },
  { id: "alert-3", title: "Worker unavailable", message: "Rahul temporarily off shift. Re-routing tasks.", type: "staff", createdAt: Date.now() - 16 * 60_000, resolved: false },
];

export const shelfZones: ShelfZone[] = Array.from({ length: 12 }, (_, index) => {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return {
    id: `zone-${index + 1}`,
    label: `Shelf ${row + 1}${String.fromCharCode(65 + col)}`,
    stock: Math.max(12, 100 - index * 6),
    recentTasks: (index % 3) + 1,
    aiInsight: index % 2 === 0 ? "Facing drift likely in evening window." : "Demand spike expected after 6PM.",
    x: 18 + col * 22,
    y: 22 + row * 24,
  };
});

export const misplacedItems: MisplacedItem[] = [
  {
    id: "mis-1",
    name: "Sparkling Water 500ml",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
    detectedLocation: "Snacks 3C",
    correctLocation: "Beverages 1A",
    severity: "critical",
  },
  {
    id: "mis-2",
    name: "Granola Protein Bar",
    image:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=600&q=80",
    detectedLocation: "Dairy 2B",
    correctLocation: "Snacks 3A",
    severity: "medium",
  },
  {
    id: "mis-3",
    name: "Ready Noodle Cup",
    image:
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80",
    detectedLocation: "Fresh 5A",
    correctLocation: "Pantry 4D",
    severity: "low",
  },
];

export const inventoryItems: InventoryItem[] = [
  { id: "inv-1", name: "Cold Brew Bottle", stockPercent: 24, suggestedReorder: 54 },
  { id: "inv-2", name: "Organic Milk", stockPercent: 36, suggestedReorder: 38 },
  { id: "inv-3", name: "Protein Chips", stockPercent: 18, suggestedReorder: 72 },
  { id: "inv-4", name: "Fruit Yogurt", stockPercent: 42, suggestedReorder: 31 },
  { id: "inv-5", name: "Energy Drink 250ml", stockPercent: 12, suggestedReorder: 88 },
  { id: "inv-6", name: "Trail Mix Jar", stockPercent: 49, suggestedReorder: 24 },
];

export const workerPerformance: WorkerPerformance[] = [
  { id: "w-1", name: "Rahul Sharma", score: 97, shiftStatus: "on-shift", role: "senior" },
  { id: "w-2", name: "Maya Singh", score: 93, shiftStatus: "on-shift", role: "worker" },
  { id: "w-3", name: "Arjun Patel", score: 88, shiftStatus: "break", role: "worker" },
  { id: "w-4", name: "Neha Gupta", score: 84, shiftStatus: "off-shift", role: "worker" },
];

export const managerRevenueSeries = [
  { label: "Mon", revenue: 82, profit: 44 },
  { label: "Tue", revenue: 88, profit: 47 },
  { label: "Wed", revenue: 92, profit: 52 },
  { label: "Thu", revenue: 87, profit: 48 },
  { label: "Fri", revenue: 96, profit: 56 },
  { label: "Sat", revenue: 104, profit: 61 },
  { label: "Sun", revenue: 98, profit: 57 },
];

export const managerStores = [
  { id: "store-a", label: "New York - 5th Ave", flag: "US", score: 92.4, alerts: 7, revenue: "₹248K" },
  { id: "store-b", label: "Chicago - West Loop", flag: "US", score: 88.7, alerts: 11, revenue: "₹214K" },
  { id: "store-c", label: "Bangalore - MG Road", flag: "IN", score: 95.2, alerts: 4, revenue: "₹201K" },
];
