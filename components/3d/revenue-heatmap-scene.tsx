"use client";

import { Suspense, useMemo, useState } from "react";
import { Environment } from "@react-three/drei";
import { SceneCanvas } from "@/components/3d/scene-canvas";

function RevenueTiles({ values }: { values: number[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const normalized = useMemo(() => {
    const max = Math.max(...values);
    return values.map((value) => value / max);
  }, [values]);

  return (
    <group position={[-3.6, 0, -3.6]}>
      {normalized.map((norm, idx) => {
        const x = idx % 8;
        const z = Math.floor(idx / 8);
        const nearHovered = hovered !== null ? Math.abs((hovered % 8) - x) + Math.abs(Math.floor(hovered / 8) - z) <= 2 : false;
        const height = 0.25 + norm * 1.8 + (nearHovered ? 0.2 : 0);

        return (
          <mesh
            key={idx}
            position={[x * 1.05, height / 2, z * 1.05]}
            castShadow
            receiveShadow
            onPointerEnter={() => setHovered(idx)}
            onPointerLeave={() => setHovered(null)}
          >
            <boxGeometry args={[0.84, height, 0.84]} />
            <meshStandardMaterial
              color={norm > 0.78 ? "#6366f1" : "#3f3f46"}
              emissive={norm > 0.78 ? "#818cf8" : "#27272a"}
              emissiveIntensity={nearHovered ? 0.8 : 0.35}
              roughness={0.45}
              metalness={0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function RevenueHeatmapScene({ values }: { values: number[] }) {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas shadows camera={{ position: [4.5, 7, 8.5], fov: 40 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight intensity={1.75} position={[5, 7, 5]} color="#818cf8" castShadow />
          <RevenueTiles values={values} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial color="#111827" roughness={0.92} />
          </mesh>
          <Environment preset="warehouse" />
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
