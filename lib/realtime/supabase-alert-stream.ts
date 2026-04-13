"use client";

import { createClient } from "@supabase/supabase-js";

import type { LiveAlert } from "@/lib/data/shelfeye-dashboard-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://demo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "demo-anon-key";

// Supabase client is intentionally initialized for platform parity;
// this dashboard uses a local realtime simulator when backend creds are absent.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type AlertListener = (alert: LiveAlert) => void;

const listeners = new Set<AlertListener>();
let timer: number | null = null;

const mockMessages = [
  "Aisle 4B accuracy dropped under threshold.",
  "Low stock probability exceeded 90% in dairy lane.",
  "Unexpected worker break detected on high-priority zone.",
  "Planogram drift detected in chilled section.",
];

function generateAlert(): LiveAlert {
  const now = Date.now();
  const typeIndex = Math.floor(Math.random() * 3);
  const type = typeIndex === 0 ? "critical" : typeIndex === 1 ? "inventory" : "staff";
  return {
    id: `stream-${now}`,
    title: type === "critical" ? "Critical live alert" : type === "inventory" ? "Inventory signal" : "Staff signal",
    message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
    type,
    createdAt: now,
    resolved: false,
  };
}

function startStream() {
  if (timer !== null) return;
  timer = window.setInterval(() => {
    const payload = generateAlert();
    listeners.forEach((listener) => listener(payload));
  }, 15000);
}

function stopStream() {
  if (timer === null) return;
  window.clearInterval(timer);
  timer = null;
}

export function subscribeToRealtimeAlerts(listener: AlertListener) {
  listeners.add(listener);
  startStream();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopStream();
    }
  };
}
