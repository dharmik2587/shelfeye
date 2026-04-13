"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

import type { ShelfState } from "@/lib/stores/shelfeye-store";

interface StoreTwinProps {
  shelves: ShelfState[];
  selectedShelfId: string | null;
  timelineHour: number;
  onSelectShelf: (id: string) => void;
}

function CameraRig({
  selectedShelfId,
  shelves,
}: {
  selectedShelfId: string | null;
  shelves: ShelfState[];
}) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 1.8, 7.5));
  const lookAt = useRef(new THREE.Vector3(0, 1.3, 0));

  useFrame((_, delta) => {
    const selected = shelves.find((shelf) => shelf.id === selectedShelfId);
    if (selected) {
      targetRef.current.set(selected.x, selected.y + 1.1, selected.z + 2.35);
      lookAt.current.set(selected.x, selected.y, selected.z);
    } else {
      targetRef.current.set(0, 1.8, 7.5);
      lookAt.current.set(0, 1.3, 0);
    }

    camera.position.lerp(targetRef.current, 1 - Math.exp(-delta * 2.8));
    const nextTarget = new THREE.Vector3().lerpVectors(camera.position, lookAt.current, 0.35);
    camera.lookAt(nextTarget);
  });

  return null;
}

function Shelf({
  shelf,
  selected,
  timelineHour,
  onClick,
}: {
  shelf: ShelfState;
  selected: boolean;
  timelineHour: number;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const pulse = 0.7 + Math.sin(timelineHour * 0.35 + shelf.risk * 0.1) * 0.2;
  const riskColor = shelf.risk > 72 ? "#fb7185" : shelf.risk > 45 ? "#f59e0b" : "#34d399";

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.08;
    const targetScale = selected ? 1.08 : 1;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-delta * 7));
    ref.current.position.y = shelf.y + Math.sin(state.clock.elapsedTime * 0.6 + shelf.x) * 0.02;
  });

  return (
    <group ref={ref} position={[shelf.x, shelf.y, shelf.z]} onClick={onClick}>
      <RoundedBox args={[1.2, 0.65, 0.9]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color={riskColor}
          emissive={riskColor}
          emissiveIntensity={selected ? 0.45 : 0.18 + pulse * 0.08}
          metalness={0.25}
          roughness={0.22}
        />
      </RoundedBox>
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[1.3, 0.08, 1]} />
        <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.45} />
      </mesh>
      <Text
        position={[0, 0.42, 0]}
        fontSize={0.14}
        color={selected ? "#e2e8f0" : "#cbd5e1"}
        anchorX="center"
        anchorY="middle"
      >
        {shelf.label}
      </Text>
    </group>
  );
}

export function StoreTwin({ shelves, selectedShelfId, timelineHour, onSelectShelf }: StoreTwinProps) {
  const floorTiles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => {
        const x = (index % 6) * 2 - 5;
        const z = Math.floor(index / 6) * 2 - 5;
        return { id: `tile-${index}`, x, z };
      }),
    [],
  );

  return (
    <div className="h-[380px] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40">
      <Canvas camera={{ position: [0, 1.8, 7.5], fov: 48 }}>
        <color attach="background" args={["#030712"]} />
        <fog attach="fog" args={["#030712", 5, 16]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 8, 2]} intensity={6} color="#67e8f9" />
        <pointLight position={[-5, 3, -2]} intensity={2.6} color="#34d399" />
        <CameraRig selectedShelfId={selectedShelfId} shelves={shelves} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.12} minDistance={3.4} maxDistance={11} />

        <group position={[0, -0.2, 0]}>
          {floorTiles.map((tile) => (
            <mesh key={tile.id} position={[tile.x * 0.5, 0, tile.z * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.9, 0.9]} />
              <meshStandardMaterial color="#0f172a" metalness={0.1} roughness={0.74} />
            </mesh>
          ))}
        </group>

        {shelves.map((shelf) => (
          <Shelf
            key={shelf.id}
            shelf={shelf}
            selected={shelf.id === selectedShelfId}
            timelineHour={timelineHour}
            onClick={() => onSelectShelf(shelf.id)}
          />
        ))}

        <Environment preset="warehouse" />
      </Canvas>
    </div>
  );
}
