"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import { SceneCanvas } from "@/components/3d/scene-canvas";

interface RevenueHeatmap3DProps {
  values: number[];
}

function RevenueHeatmapInner({ values }: RevenueHeatmap3DProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const rippleRef = useRef<number>(0);

  const normalized = useMemo(() => {
    const max = Math.max(...values, 1);
    return values.slice(0, 80).map((v) => v / max);
  }, [values]);

  useFrame((state) => {
    rippleRef.current = state.clock.elapsedTime;
  });

  return (
    <>
      <color attach="background" args={["#0c0c10"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 6]} intensity={1.6} color="#93c5fd" castShadow />
      <pointLight position={[-4, 4, -4]} intensity={0.8} color="#22d3ee" />

      <group position={[-4.2, 0, -3.2]}>
        {normalized.map((norm, idx) => {
          const x = idx % 10;
          const z = Math.floor(idx / 10);
          const near = hovered !== null ? Math.abs((hovered % 10) - x) + Math.abs(Math.floor(hovered / 10) - z) <= 2 : false;
          const height = 0.2 + norm * 2 + (near ? 0.2 : 0);

          return (
            <mesh
              key={idx}
              position={[x * 0.9, height / 2, z * 0.9]}
              castShadow
              receiveShadow
              onPointerEnter={() => setHovered(idx)}
              onPointerLeave={() => setHovered(null)}
            >
              <boxGeometry args={[0.82, height, 0.82]} />
              <meshStandardMaterial
                color={norm > 0.7 ? "#6366f1" : "#30303a"}
                emissive={norm > 0.7 ? "#818cf8" : "#1f1f2a"}
                emissiveIntensity={near ? 1 : 0.4}
                roughness={0.4}
                metalness={0.35}
              />
            </mesh>
          );
        })}
      </group>

      {/* ripple indicator */}
      {hovered !== null && (
        <mesh position={[((hovered % 10) - 4.2) * 0.9, 0.05, (Math.floor(hovered / 10) - 3.2) * 0.9]}>
          <ringGeometry args={[0.3, 0.35, 24]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0.6} />
        </mesh>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.08} />
      </mesh>

      <Environment preset="warehouse" />
    </>
  );
}

export function RevenueHeatmap3D({ values }: RevenueHeatmap3DProps) {
  return (
    <SceneCanvas camera={{ position: [6, 8, 10], fov: 42 }} shadows dpr={[1, 1.35]}>
      <RevenueHeatmapInner values={values} />
    </SceneCanvas>
  );
}
