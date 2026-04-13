"use client";

import { Suspense, useState } from "react";
import { Html, Text } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { SceneCanvas } from "@/components/3d/scene-canvas";

const stores = ["Boston Flagship", "Austin Urban", "Seattle Bay", "Chicago Loop"];

function ToggleSwitch({
  label,
  position,
}: {
  label: string;
  position: [number, number, number];
}) {
  const [enabled, setEnabled] = useState(true);

  return (
    <group position={position}>
      <mesh onClick={() => setEnabled((prev) => !prev)}>
        <boxGeometry args={[1.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[enabled ? 0.45 : -0.45, 0, 0.04]}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={enabled ? "#22c55e" : "#71717a"} emissive={enabled ? "#22c55e" : "#52525b"} emissiveIntensity={0.8} />
      </mesh>
      <Text position={[0, -0.55, 0]} fontSize={0.15} color="#e4e4e7" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function StoreCarousel() {
  const [active, setActive] = useState(0);

  return (
    <group position={[0, 0.4, 0]}>
      {stores.map((store, idx) => (
        <group key={store} position={[idx * 2.2 - 3.3, 0, 0]}>
          <mesh onClick={() => setActive(idx)}>
            <boxGeometry args={[1.5, 1, 1.2]} />
            <meshStandardMaterial
              color="#27272a"
              emissive={active === idx ? "#818cf8" : "#3f3f46"}
              emissiveIntensity={active === idx ? 0.95 : 0.2}
              metalness={0.45}
              roughness={0.38}
            />
          </mesh>
          <Text position={[0, -0.85, 0]} fontSize={0.12} color="#d4d4d8" anchorX="center" maxWidth={2}>
            {store}
          </Text>
          {active === idx && (
            <Html position={[0, 1.05, 0]} center>
              <div className="rounded-3xl border border-indigo-400/30 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-200">
                Active Control Node
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

export function SettingsCoreScene() {
  return (
    <div className="h-[440px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas shadows camera={{ position: [0, 4.5, 11], fov: 42 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight intensity={1.8} position={[4, 7, 5]} color="#818cf8" castShadow />
          <pointLight intensity={1.2} position={[-4, 2.5, -2]} color="#fbbf24" />

          <Physics>
            <RigidBody type="fixed">
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[14, 9]} />
                <meshStandardMaterial color="#111827" roughness={0.9} />
              </mesh>
            </RigidBody>
          </Physics>

          <StoreCarousel />
          <ToggleSwitch label="Realtime Alerts" position={[-3.4, -0.2, 2.8]} />
          <ToggleSwitch label="Voice Echo" position={[0, -0.2, 2.8]} />
          <ToggleSwitch label="Night Lighting" position={[3.4, -0.2, 2.8]} />

          <group position={[0, 1.8, 3.1]}>
            <mesh>
              <torusGeometry args={[0.5, 0.08, 18, 64]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
            </mesh>
            <Text position={[0, -0.75, 0]} fontSize={0.15} color="#fde68a" anchorX="center">
              Notification Bell Mesh
            </Text>
          </group>
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
