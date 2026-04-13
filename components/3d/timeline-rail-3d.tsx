"use client";

import { useMemo } from "react";
import { Physics, RigidBody } from "@react-three/rapier";
import { SceneCanvas } from "@/components/3d/scene-canvas";

interface TimelineRail3DProps {
  value: number;
  onChange: (value: number) => void;
}

export function TimelineRail3D({ value, onChange }: TimelineRail3DProps) {
  const knobX = useMemo(() => (value / 100) * 8 - 4, [value]);

  return (
    <div className="relative h-24 w-full overflow-hidden rounded-3xl border border-indigo-400/20 bg-zinc-900/85">
      <SceneCanvas camera={{ position: [0, 3.1, 7], fov: 40 }} dpr={[1, 1.2]}>
        <ambientLight intensity={0.8} />
        <pointLight intensity={1.8} position={[0, 5, 2]} color="#818cf8" />
        <Physics gravity={[0, -0.4, 0]}>
          <RigidBody type="fixed">
            <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={(event) => onChange(Math.max(0, Math.min(100, ((event.point.x + 4) / 8) * 100)))}>
              <boxGeometry args={[8.2, 0.26, 0.28]} />
              <meshStandardMaterial color="#18181b" emissive="#3730a3" emissiveIntensity={0.25} />
            </mesh>
          </RigidBody>

          <RigidBody type="kinematicPosition" position={[knobX, 0.26, 0]}>
            <mesh>
              <cylinderGeometry args={[0.26, 0.26, 0.4, 32]} />
              <meshStandardMaterial color="#6366f1" emissive="#818cf8" emissiveIntensity={0.8} metalness={0.62} roughness={0.2} />
            </mesh>
          </RigidBody>
        </Physics>
      </SceneCanvas>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        aria-label="Timeline control"
      />
    </div>
  );
}
