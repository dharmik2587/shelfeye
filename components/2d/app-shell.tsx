"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { HolographicTopBar } from "@/components/2d/holographic-top-bar";
import { MobileOrbNav } from "@/components/2d/mobile-orb-nav";
import { ProfileOrbMenu } from "@/components/2d/profile-orb-menu";
import { ThemeOrbToggle } from "@/components/2d/theme-orb-toggle";
import { NavigationOrb } from "@/components/3d/navigation-orb";
import { EchoSphereChatbot } from "@/components/3d/echo-sphere-chatbot";
import { useSupabaseEchoStream } from "@/lib/realtime/use-supabase-echo-stream";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selectedShelfId = useEchoEngineStore((state) => state.selectedShelfId);

  useSupabaseEchoStream();

  if (AUTH_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 scene-overlay" />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6">
        <div className="min-w-0 flex-1 items-center gap-4 lg:flex">
          <NavigationOrb />
          <HolographicTopBar />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <ThemeOrbToggle />
          <ProfileOrbMenu />
        </div>
      </header>

      <main className="relative z-20 min-h-screen px-4 pb-28 pt-28 sm:px-8 lg:px-12 lg:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <EchoSphereChatbot />
      <MobileOrbNav />

      <div className="sr-only" aria-live="polite">
        {selectedShelfId ? `Selected ${selectedShelfId}` : "No shelf selected"}
      </div>

      <motion.div
        key={`glow-${pathname}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-0 z-10"
      />
    </div>
  );
}
