"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Group } from "three";
import { SceneCanvas } from "@/components/3d/scene-canvas";

interface KpiDatum {
  id: string;
  label: string;
  value: string;
  color: string;
}

function KpiArcMeshes({ data }: { data: KpiDatum[] }) {
  const refs = useRef<Array<Group | null>>([]);

  useFrame((state) => {
    refs.current.forEach((group, idx) => {
      if (!group) {
        return;
      }
      const t = state.clock.elapsedTime + idx * 0.35;
      group.rotation.y = Math.sin(t) * 0.2;
      group.rotation.x = Math.cos(t) * 0.08;
      group.position.y = Math.sin(t * 1.3) * 0.08;
    });
  });

  const layout = useMemo(
    () =>
      data.map((datum, idx) => {
        const angle = -0.85 + idx * 0.56;
        return {
          ...datum,
          x: Math.cos(angle) * 3.4,
          z: Math.sin(angle) * 1.4,
        };
      }),
    [data],
  );

  return (
    <group position={[0, 0, 0]}>
      {layout.map((datum, idx) => (
        <group
          key={datum.id}
          ref={(node) => {
            refs.current[idx] = node;
          }}
          position={[datum.x, 0, datum.z]}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.7, 2, 0.45]} />
            <meshPhysicalMaterial
              color="#27272a"
              metalness={0.55}
              roughness={0.22}
              clearcoat={0.7}
              emissive={datum.color}
              emissiveIntensity={0.25}
            />
          </mesh>
          <Text position={[0, 0.3, 0.24]} fontSize={0.18} color="#a1a1aa" anchorX="center">
            {datum.label}
          </Text>
          <Text position={[0, -0.2, 0.24]} fontSize={0.36} color={datum.color} anchorX="center">
            {datum.value}
          </Text>
        </group>
      ))}
    </group>
  );
}

export function KpiArcScene({ data }: { data: KpiDatum[] }) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
      <SceneCanvas shadows camera={{ position: [0, 2.4, 8], fov: 42 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight intensity={1.8} color="#818cf8" position={[4, 6, 3]} castShadow />
          <KpiArcMeshes data={data} />
          <Environment preset="city" />
          <EffectComposer>
            <Bloom luminanceThreshold={0.24} intensity={0.65} />
          </EffectComposer>
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
