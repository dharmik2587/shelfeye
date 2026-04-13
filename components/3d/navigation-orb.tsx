"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AudioLines,
  ChartNoAxesCombined,
  CheckSquare,
  Settings,
} from "lucide-react";
import type { Mesh } from "three";

import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

function OrbMesh() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x = Math.sin(Date.now() / 1400) * 0.1;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.62, 64, 64]} />
      <meshPhysicalMaterial
        color="#6366f1"
        clearcoat={1}
        metalness={0.75}
        roughness={0.1}
        transmission={0.18}
        thickness={0.9}
        iridescence={1}
        iridescenceIOR={1.3}
        emissive="#3730a3"
        emissiveIntensity={1.15}
      />
    </mesh>
  );
}

const sectors = [
  { id: "dashboard", label: "Dashboard Pulse", icon: Activity, href: "/dashboard" },
  { id: "echo-canvas", label: "Echo Canvas", icon: AudioLines, href: "/echo-canvas" },
  { id: "analytics", label: "Analytics Flow", icon: ChartNoAxesCombined, href: "/analytics" },
  { id: "tasks", label: "Tasks Orbit", icon: CheckSquare, href: "/tasks" },
  { id: "settings", label: "Settings Core", icon: Settings, href: "/settings" },
] as const;

export function NavigationOrb() {
  const router = useRouter();
  const setActiveSector = useEchoEngineStore((state) => state.setActiveSector);
  const [expanded, setExpanded] = useState(false);

  const radialPoints = useMemo(
    () =>
      sectors.map((sector, index) => {
        const angle = -Math.PI / 2 + (index / sectors.length) * Math.PI * 1.6;
        return {
          ...sector,
          x: Math.cos(angle) * 124,
          y: Math.sin(angle) * 96,
        };
      }),
    [],
  );

  return (
    <div
      className="relative z-50 hidden h-20 w-20 lg:block"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <button
        className="h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-zinc-900/60 shadow-volumetric backdrop-blur-3xl"
        aria-label="Open holographic navigation"
        type="button"
      >
        <Canvas camera={{ position: [0, 0, 2.6], fov: 42 }} dpr={[1, 1.25]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={1.8} color="#7c83ff" />
          <OrbMesh />
          <Environment preset="city" />
        </Canvas>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="pointer-events-none absolute left-0 top-0 h-72 w-72"
          >
            {radialPoints.map((sector, idx) => {
              const Icon = sector.icon;

              return (
                <motion.button
                  key={sector.id}
                  type="button"
                  className="pointer-events-auto absolute flex h-14 w-44 items-center gap-3 rounded-3xl border border-indigo-400/30 bg-zinc-900/90 px-4 text-left text-sm text-zinc-200 shadow-volumetric backdrop-blur-3xl hover:scale-105"
                  style={{ left: sector.x, top: sector.y }}
                  initial={{ opacity: 0, x: -18, y: 8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 160, damping: 15 }}
                  onClick={() => {
                    setActiveSector(sector.id);
                    router.push(sector.href);
                  }}
                >
                  <Icon className="h-4 w-4 text-indigo-300" />
                  <span>{sector.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
