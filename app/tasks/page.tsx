"use client";

import { useMemo, useState } from "react";

import { TasksOrbitScene } from "@/components/3d/tasks-orbit-scene";
import { BadgeCheck, CircleDashed, Clock3 } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

export default function TasksPage() {
  const tasks = useEchoEngineStore((state) => state.tasks);
  const updateTask = useEchoEngineStore((state) => state.updateTask);
  const isMobile = useIsMobile();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const grouped = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "todo"),
      inProgress: tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done"),
    }),
    [tasks],
  );

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl">Tasks Orbit</h1>
        <p className="mt-2 text-zinc-300">Drag mission pins around the Echo Canvas and snap them onto shelf targets.</p>
      </header>

      {isMobile ? (
        <div className="echo-glass p-6 text-zinc-300">Task orbit 3D mode is optimized for desktop. Use cards below on mobile.</div>
      ) : (
        <TasksOrbitScene selectedTaskId={selectedTaskId} onSelectTask={setSelectedTaskId} />
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="echo-glass p-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
            <CircleDashed className="h-4 w-4 text-zinc-400" />
            Todo
          </div>
          <div className="space-y-3">
            {grouped.todo.map((task) => (
              <article key={task.id} className="rounded-3xl border border-zinc-700 bg-zinc-950/65 p-4">
                <p className="text-sm">{task.title}</p>
                <p className="mt-1 text-xs text-zinc-400">Priority: {task.priority}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="echo-glass p-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
            <Clock3 className="h-4 w-4 text-amber-300" />
            In Progress
          </div>
          <div className="space-y-3">
            {grouped.inProgress.map((task) => (
              <article key={task.id} className="rounded-3xl border border-amber-300/30 bg-zinc-950/65 p-4">
                <p className="text-sm">{task.title}</p>
                <p className="mt-1 text-xs text-zinc-400">Assigned: {task.shelfId ?? "Unassigned"}</p>
                <button
                  type="button"
                  className="mt-3 rounded-3xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 transition hover:bg-emerald-500/20"
                  onClick={() => updateTask(task.id, { status: "done" })}
                >
                  Mark Complete
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="echo-glass p-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
            <BadgeCheck className="h-4 w-4 text-emerald-300" />
            Completed
          </div>
          <div className="space-y-3">
            {grouped.done.map((task) => (
              <article key={task.id} className="rounded-3xl border border-emerald-300/30 bg-zinc-950/65 p-4">
                <p className="text-sm">{task.title}</p>
                <p className="mt-1 text-xs text-zinc-400">Resolved</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
