"use client";

import { motion } from "framer-motion";

import type { ShelfState } from "@/lib/stores/shelfeye-store";

interface StoreMap2DProps {
  shelves: ShelfState[];
  selectedShelfId: string | null;
  timelineHour: number;
  onSelectShelf: (id: string) => void;
}

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 720;

function normalize(value: number, min: number, max: number) {
  if (max - min < 0.0001) return 0.5;
  return (value - min) / (max - min);
}

function riskColor(risk: number) {
  if (risk >= 72) return "#fb7185";
  if (risk >= 46) return "#f59e0b";
  return "#34d399";
}

export function StoreMap2D({ shelves, selectedShelfId, timelineHour, onSelectShelf }: StoreMap2DProps) {
  const xMin = Math.min(...shelves.map((shelf) => shelf.x), -4);
  const xMax = Math.max(...shelves.map((shelf) => shelf.x), 4);
  const zMin = Math.min(...shelves.map((shelf) => shelf.z), -4);
  const zMax = Math.max(...shelves.map((shelf) => shelf.z), 4);

  const projected = shelves.map((shelf) => {
    const nx = normalize(shelf.x, xMin, xMax);
    const nz = normalize(shelf.z, zMin, zMax);
    return {
      ...shelf,
      left: 100 + nx * (VIEW_WIDTH - 200),
      top: 110 + nz * (VIEW_HEIGHT - 220),
    };
  });

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75">
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="h-full w-full">
        <defs>
          <linearGradient id="floor-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0b1628" />
            <stop offset="100%" stopColor="#0f2238" />
          </linearGradient>
          <pattern id="grid-pattern" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1.3" />
          </pattern>
        </defs>

        <rect x={24} y={24} width={VIEW_WIDTH - 48} height={VIEW_HEIGHT - 48} rx={30} fill="url(#floor-gradient)" />
        <rect x={24} y={24} width={VIEW_WIDTH - 48} height={VIEW_HEIGHT - 48} rx={30} fill="url(#grid-pattern)" />

        <rect x={88} y={84} width={VIEW_WIDTH - 176} height={VIEW_HEIGHT - 168} rx={26} fill="none" stroke="rgba(148,163,184,0.35)" strokeDasharray="8 10" />

        <text x={120} y={70} fill="#e2e8f0" fontSize={24} fontWeight={600}>
          Store Map (2D)
        </text>
        <text x={120} y={102} fill="#94a3b8" fontSize={16}>
          Crisp top-down shelf intelligence view
        </text>

        <g>
          <circle cx={860} cy={72} r={8} fill="#34d399" />
          <text x={878} y={78} fill="#cbd5e1" fontSize={14}>
            Healthy
          </text>
          <circle cx={958} cy={72} r={8} fill="#f59e0b" />
          <text x={976} y={78} fill="#cbd5e1" fontSize={14}>
            Warning
          </text>
          <circle cx={1064} cy={72} r={8} fill="#fb7185" />
          <text x={1082} y={78} fill="#cbd5e1" fontSize={14}>
            Critical
          </text>
        </g>
      </svg>

      {projected.map((shelf) => {
        const active = shelf.id === selectedShelfId;
        const beat = 0.85 + Math.sin(timelineHour * 0.2 + shelf.risk * 0.08) * 0.08;
        return (
          <motion.button
            key={shelf.id}
            onClick={() => onSelectShelf(shelf.id)}
            whileHover={{ y: -2, scale: 1.02 }}
            animate={{
              scale: active ? 1.07 : beat,
              boxShadow: active
                ? "0 0 0 2px rgba(125,211,252,0.95), 0 18px 32px -18px rgba(34,211,238,0.95)"
                : "0 10px 24px -16px rgba(2,6,23,0.9)",
            }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/20 px-3 py-2 text-left text-[11px] font-medium text-slate-100"
            style={{
              left: `${(shelf.left / VIEW_WIDTH) * 100}%`,
              top: `${(shelf.top / VIEW_HEIGHT) * 100}%`,
              width: "92px",
              background: `linear-gradient(150deg, ${riskColor(shelf.risk)}cc, rgba(15,23,42,0.9))`,
            }}
          >
            <span className="block">{shelf.label}</span>
            <span className="block text-[10px] text-slate-200/80">Risk {shelf.risk}%</span>
          </motion.button>
        );
      })}
    </div>
  );
}
