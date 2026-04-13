"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useShelfEyeAuthStore } from "@/lib/stores/shelfeye-auth-store";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useShelfEyeAuthStore((state) => state.hydrated);
  const isAuthenticated = useShelfEyeAuthStore((state) => state.isAuthenticated);
  const setHydrated = useShelfEyeAuthStore((state) => state.setHydrated);

  useEffect(() => {
    if (!hydrated) {
      const timer = window.setTimeout(() => setHydrated(true), 80);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [hydrated, setHydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/auth");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel rounded-2xl px-6 py-5 text-sm text-slate-200">
          Securing workspace...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
