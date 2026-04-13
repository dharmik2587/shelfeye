"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { useShelfEyeStore } from "@/lib/stores/shelfeye-store";

const TRAIL_SIZE = 6;

const MODE_STYLES: Record<string, string> = {
  default: "border-cyan-300/80 bg-cyan-300/20 shadow-[0_0_30px_rgba(34,211,238,0.35)]",
  target: "border-rose-300/80 bg-rose-300/20 shadow-[0_0_30px_rgba(251,113,133,0.45)]",
  hologram: "border-violet-300/80 bg-violet-300/20 shadow-[0_0_30px_rgba(167,139,250,0.45)]",
  pulse: "border-emerald-300/80 bg-emerald-300/20 shadow-[0_0_30px_rgba(16,185,129,0.45)]",
};

export function CursorTracker() {
  const cursorMode = useShelfEyeStore((state) => state.cursorMode);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 22, stiffness: 320, mass: 0.24 });
  const springY = useSpring(y, { damping: 22, stiffness: 320, mass: 0.24 });
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const query = window.matchMedia("(any-pointer: fine)");
    const updatePointer = () => setIsFinePointer(query.matches);
    updatePointer();
    query.addEventListener("change", updatePointer);
    return () => query.removeEventListener("change", updatePointer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isFinePointer) {
      root.classList.add("cursor-tracker-active");
    } else {
      root.classList.remove("cursor-tracker-active");
    }
    return () => root.classList.remove("cursor-tracker-active");
  }, [isFinePointer]);

  useEffect(() => {
    if (!isFinePointer) return undefined;
    const handleMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setIsVisible(true);
      setTrail((current) => [{ x: event.clientX, y: event.clientY }, ...current].slice(0, TRAIL_SIZE));
    };
    const hideCursor = () => setIsVisible(false);
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseout", hideCursor);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", hideCursor);
    };
  }, [isFinePointer, x, y]);

  const modeClass = useMemo(() => MODE_STYLES[cursorMode] ?? MODE_STYLES.default, [cursorMode]);

  if (!isFinePointer) return null;

  return (
    <>
      {trail.map((point, index) => (
        <motion.span
          key={`cursor-dot-${index}`}
          className="pointer-events-none fixed z-[110] h-2 w-2 rounded-full bg-cyan-200/55"
          initial={false}
          animate={{
            x: point.x - 4,
            y: point.y - 4,
            opacity: isVisible ? (TRAIL_SIZE - index) / TRAIL_SIZE : 0,
            scale: 1 - index * 0.08,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 26, mass: 0.3 }}
        />
      ))}

      <motion.span
        className={`pointer-events-none fixed z-[120] h-12 w-12 rounded-full border ${modeClass}`}
        style={{
          translateX: springX,
          translateY: springY,
          marginLeft: -24,
          marginTop: -24,
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: cursorMode === "target" ? 1.05 : 1,
        }}
        transition={{ duration: 0.18 }}
      />
      <motion.span
        className="pointer-events-none fixed z-[121] h-2.5 w-2.5 rounded-full bg-white"
        style={{
          translateX: springX,
          translateY: springY,
          marginLeft: -5,
          marginTop: -5,
        }}
        animate={{ opacity: isVisible ? 0.95 : 0 }}
      />
    </>
  );
}
