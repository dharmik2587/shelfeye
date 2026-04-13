"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Html, Text } from "@react-three/drei";
import * as THREE from "three";

import { SceneCanvas } from "@/components/3d/scene-canvas";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

function DwellTerrain() {
  const geom = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(12, 8, 60, 40);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const height = Math.sin(x * 0.8) * 0.6 + Math.cos(y * 0.9) * 0.45;
      pos.setZ(i, height);
    }

    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -0.6, -1]} receiveShadow>
      <meshStandardMaterial color="#1e1b4b" emissive="#312e81" emissiveIntensity={0.6} roughness={0.5} metalness={0.4} />
    </mesh>
  );
}

function FlowRibbons() {
  const ribbons = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, idx) => {
        const points = Array.from({ length: 8 }).map((__, pIdx) =>
          new THREE.Vector3(pIdx * 1.8 - 6.5, Math.sin((pIdx + idx) * 0.6) + idx * 0.22, pIdx * 0.3 - 1.4),
        );
        return new THREE.CatmullRomCurve3(points);
      }),
    [],
  );

  return (
    <group position={[0, 1, -0.6]}>
      {ribbons.map((curve, idx) => {
        const geometry = new THREE.TubeGeometry(curve, 160, 0.07 + idx * 0.015, 16, false);
        return (
          <mesh key={idx} geometry={geometry}>
            <meshStandardMaterial
              color={idx % 2 === 0 ? "#22d3ee" : "#6366f1"}
              emissive={idx % 2 === 0 ? "#0891b2" : "#4338ca"}
              emissiveIntensity={0.75}
              metalness={0.35}
              roughness={0.28}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FunnelCones() {
  const levels = [92, 66, 41, 23];

  return (
    <group position={[4.5, 0.2, 1.4]}>
      {levels.map((value, idx) => (
        <group key={idx} position={[0, idx * 0.8, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.9 - idx * 0.16, 0.6, 28, 1, true]} />
            <meshStandardMaterial color="#27272a" emissive="#6366f1" emissiveIntensity={0.35} metalness={0.65} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.75 - idx * 0.16, 0.75 - idx * 0.16, (value / 100) * 0.5, 24]} />
            <meshStandardMaterial color="#6366f1" emissive="#818cf8" emissiveIntensity={0.75} />
          </mesh>
          <Text position={[1.1, 0, 0]} fontSize={0.16} color="#e4e4e7">
            {value}%
          </Text>
        </group>
      ))}
    </group>
  );
}

function ProductOrbs() {
  const [selected, setSelected] = useState<number | null>(null);
  const refs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    refs.current.forEach((mesh, idx) => {
      if (!mesh) {
        return;
      }
      mesh.position.y = Math.sin(state.clock.elapsedTime * 1.3 + idx) * 0.2 + 1.2;
      mesh.rotation.y += 0.01;
    });
  });

  return (
    <group position={[-4.6, 0, 1.2]}>
      {["Fresh Produce", "Beverages", "Snacks"].map((name, idx) => (
        <group key={name} position={[idx * 1.9, 0, 0]}>
          <mesh
            ref={(node) => {
              refs.current[idx] = node;
            }}
            onClick={() => setSelected(idx)}
          >
            <sphereGeometry args={[0.5, 46, 46]} />
            <meshPhysicalMaterial color="#0f172a" emissive="#22d3ee" emissiveIntensity={0.7} metalness={0.8} roughness={0.1} />
          </mesh>
          {selected === idx && (
            <Html position={[0, 0.95, 0]} center>
              <div className="rounded-3xl border border-cyan-400/30 bg-zinc-900/90 px-4 py-3 text-xs text-zinc-200 shadow-volumetric">
                <p className="font-semibold">{name}</p>
                <p className="mt-1 text-zinc-400">Tap-through conversion +6.4%</p>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

export function AnalyticsFlowScene() {
  const shelves = useEchoEngineStore((state) => state.shelves);
  const urgent = shelves.some((shelf) => shelf.health === "critical");

  return (
    <div className="h-[calc(100vh-220px)] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas shadows camera={{ position: [0, 5.4, 12], fov: 42 }}>
        <Suspense fallback={null}>
          <color attach="background" args={["#09090b"]} />
          <fog attach="fog" args={["#09090b", 8, 24]} />
          <ambientLight intensity={0.6} color={urgent ? "#fecaca" : "#dbeafe"} />
          <directionalLight intensity={2} color={urgent ? "#fb7185" : "#818cf8"} position={[6, 8, 5]} castShadow />
          <pointLight intensity={1.2} color="#22d3ee" position={[-3, 4, 2]} />

          <DwellTerrain />
          <FlowRibbons />
          <FunnelCones />
          <ProductOrbs />
          <Environment preset="night" />
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
