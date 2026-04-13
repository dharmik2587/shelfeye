"use client";

import { useEffect } from "react";

import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

/**
 * Placeholder realtime hook.
 * Replace with Supabase channel subscription later.
 */
export function useSupabaseEchoStream() {
  const randomPulse = useEchoEngineStore((state) => state.randomPulse);

  useEffect(() => {
    const interval = setInterval(() => randomPulse(), 2800);
    return () => clearInterval(interval);
  }, [randomPulse]);

  // Supabase example:
  // const channel = supabase.channel("echo-store").on("postgres_changes", {...}, payload => {
  //   useEchoEngineStore.getState().setTimeline(payload.new.timeline);
  // }).subscribe();
  // return () => supabase.removeChannel(channel);
}
