"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

import { SceneCanvas } from "@/components/3d/scene-canvas";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

interface TasksOrbitSceneProps {
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

function OrbitPins({
  selectedTaskId,
  onSelectTask,
}: {
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}) {
  const tasks = useEchoEngineStore((state) => state.tasks);
  const refs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    refs.current.forEach((pin, idx) => {
      if (!pin) {
        return;
      }
      const t = state.clock.elapsedTime * 0.34 + idx;
      pin.position.x = Math.cos(t) * (3.2 + idx * 0.2);
      pin.position.z = Math.sin(t) * (3.2 + idx * 0.2);
      pin.position.y = Math.sin(t * 2) * 0.22 + 1.1;
      pin.rotation.y += 0.015;
    });
  });

  return (
    <group>
      {tasks.map((task, idx) => {
        const active = task.id === selectedTaskId;
        const color = task.priority === "high" ? "#fb7185" : task.priority === "medium" ? "#fbbf24" : "#22d3ee";

        return (
          <group key={task.id}>
            <mesh
              ref={(node) => {
                refs.current[idx] = node;
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectTask(active ? null : task.id);
              }}
              castShadow
            >
              <coneGeometry args={[active ? 0.28 : 0.22, active ? 0.85 : 0.72, 20]} />
              <meshStandardMaterial color="#18181b" emissive={color} emissiveIntensity={active ? 1.3 : 0.9} />
            </mesh>
            <Text position={[0, 0.5, 0]} fontSize={0.11} color="#d4d4d8" anchorX="center">
              {task.title}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function ShelfTargets({ activeTaskId }: { activeTaskId: string | null }) {
  const shelves = useEchoEngineStore((state) => state.shelves);
  const updateTask = useEchoEngineStore((state) => state.updateTask);

  const compactShelves = useMemo(() => shelves.slice(0, 12), [shelves]);

  return (
    <group position={[0, 0, 0]}>
      {compactShelves.map((shelf, idx) => {
        const angle = (idx / compactShelves.length) * Math.PI * 2;
        const x = Math.cos(angle) * 5.4;
        const z = Math.sin(angle) * 5.4;

        return (
          <group key={shelf.id} position={[x, 0.1, z]}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                if (activeTaskId) {
                  updateTask(activeTaskId, { shelfId: shelf.id, status: "in-progress" });
                }
              }}
              receiveShadow
            >
              <cylinderGeometry args={[0.4, 0.4, 0.12, 24]} />
              <meshStandardMaterial
                color="#27272a"
                emissive={activeTaskId ? "#818cf8" : "#3f3f46"}
                emissiveIntensity={activeTaskId ? 0.7 : 0.25}
              />
            </mesh>
            <Text position={[0, 0.28, 0]} fontSize={0.08} color="#a1a1aa" anchorX="center">
              {shelf.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export function TasksOrbitScene({ selectedTaskId, onSelectTask }: TasksOrbitSceneProps) {
  return (
    <div className="h-[420px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas camera={{ position: [0, 7.5, 9], fov: 40 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.58} />
          <directionalLight intensity={1.9} position={[5, 7, 4]} color="#818cf8" castShadow />
          <pointLight intensity={1} position={[-4, 3, -2]} color="#22d3ee" />

          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[1.2, 42, 42]} />
            <meshStandardMaterial color="#18181b" emissive="#6366f1" emissiveIntensity={0.7} metalness={0.75} roughness={0.22} />
          </mesh>

          <OrbitPins selectedTaskId={selectedTaskId} onSelectTask={onSelectTask} />
          <ShelfTargets activeTaskId={selectedTaskId} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <circleGeometry args={[7.2, 72]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
