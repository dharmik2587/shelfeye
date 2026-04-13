"use client";

import { AlertItem, WorkerTask, useLuminaStore } from "@/lib/stores/lumina-store";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWorkerTasks() {
  await sleep(450);
  return useLuminaStore.getState().workerTasks;
}

export async function fetchAlerts() {
  await sleep(300);
  return useLuminaStore.getState().alerts;
}

export async function completeWorkerTask(taskId: string) {
  await sleep(280);
  useLuminaStore.getState().completeTask(taskId);
  return taskId;
}

export async function resolveAlertById(alertId: string) {
  await sleep(280);
  useLuminaStore.getState().resolveAlert(alertId);
  return alertId;
}

export async function simulateShelfAnalysis() {
  await sleep(1400);
  return {
    score: 93.4,
    findings: [
      { id: "f-1", label: "Low Stock", confidence: 96, x: 26, y: 22, w: 24, h: 20 },
      { id: "f-2", label: "Misplaced", confidence: 88, x: 58, y: 34, w: 20, h: 26 },
      { id: "f-3", label: "Damaged", confidence: 79, x: 18, y: 58, w: 16, h: 18 },
    ],
  };
}

export async function fetchManagerKpis() {
  await sleep(420);
  return {
    health: 92.4,
    delta: 3.1,
    footfall: 24180,
    conversion: 37.8,
    accuracy: 95.6,
    revenue: 438200,
  };
}

export async function pushSimulatedAlert() {
  const now = Date.now();
  const samples: Omit<AlertItem, "id" | "createdAt" | "resolved">[] = [
    {
      title: "Shelf 1F nearing stockout",
      detail: "Velocity spike detected for energy bars in aisle 1F.",
      category: "inventory",
      severity: "warning",
    },
    {
      title: "Cashier lane congestion",
      detail: "Checkout wait time crossed 4m threshold.",
      category: "staff",
      severity: "info",
    },
    {
      title: "Critical compliance drop",
      detail: "Planogram mismatch above 20% in aisle 5C.",
      category: "critical",
      severity: "critical",
    },
  ];
  const sample = samples[now % samples.length];
  useLuminaStore.getState().pushRealtimeAlert(sample);
  return sample;
}

export function buildTaskIds(tasks: WorkerTask[]) {
  return tasks.map((task) => task.id);
}
