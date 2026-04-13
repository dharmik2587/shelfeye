"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import type { Group } from "three";
import { SceneCanvas } from "@/components/3d/scene-canvas";

interface AlertNode {
  id: string;
  title: string;
  severity: "amber" | "rose";
}

function AlertOrbs({ alerts }: { alerts: AlertNode[] }) {
  const refs = useRef<Array<Group | null>>([]);

  useFrame((state) => {
    refs.current.forEach((group, idx) => {
      if (!group) {
        return;
      }
      const t = state.clock.elapsedTime * 1.2 + idx;
      group.position.y = idx * 1.4 + Math.sin(t) * 0.16;
    });
  });

  return (
    <group position={[0, -1.3, 0]}>
      {alerts.map((alert, idx) => {
        const emissive = alert.severity === "amber" ? "#f59e0b" : "#fb7185";

        return (
          <group
            key={alert.id}
            ref={(node) => {
              refs.current[idx] = node;
            }}
            position={[0, idx * 1.4, 0]}
          >
            <mesh>
              <sphereGeometry args={[0.38, 42, 42]} />
              <meshStandardMaterial color="#18181b" emissive={emissive} emissiveIntensity={1.2} />
            </mesh>
            <Billboard position={[1.3, 0, 0]}>
              <Text fontSize={0.2} color="#e4e4e7" anchorX="left">
                {alert.title}
              </Text>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

export function AlertsOrbStack({ alerts }: { alerts: AlertNode[] }) {
  return (
    <div className="h-[360px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas camera={{ position: [3.2, 2, 5.8], fov: 40 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <pointLight intensity={1.8} position={[2, 4, 2]} color="#f97316" />
          <AlertOrbs alerts={alerts} />
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
