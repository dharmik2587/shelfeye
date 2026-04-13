"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Text } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, GodRays } from "@react-three/postprocessing";
import * as THREE from "three";

import { SceneCanvas } from "@/components/3d/scene-canvas";
import { ShelfModel } from "@/components/3d/shelf-model";
import { SceneLights } from "@/components/3d/scene-lights";
import { EchoTrailMaterialImpl } from "@/shaders/echo-trail-material";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";

function CameraRig({ selectedShelfPosition }: { selectedShelfPosition?: [number, number, number] }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const target = selectedShelfPosition
      ? new THREE.Vector3(selectedShelfPosition[0] + 2.2, 2.2, selectedShelfPosition[2] + 2.8)
      : new THREE.Vector3(0, 8.6, 13.5);

    camera.position.lerp(target, 1 - Math.exp(-delta * 3.2));

    const lookAt = selectedShelfPosition
      ? new THREE.Vector3(selectedShelfPosition[0], 0.8, selectedShelfPosition[2])
      : new THREE.Vector3(0, 0.5, 4);

    camera.lookAt(lookAt);
  });

  return null;
}

function EchoTrails() {
  const pointsRef = useRef<THREE.Points>(null);
  const material = useMemo(() => new EchoTrailMaterialImpl(), []);

  const positions = useMemo(() => {
    const pointCount = 860;
    const data = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i += 1) {
      const t = i / pointCount;
      data[i * 3] = Math.sin(t * Math.PI * 8) * 8;
      data[i * 3 + 1] = Math.cos(t * Math.PI * 7) * 1.4 + 1.2;
      data[i * 3 + 2] = (t - 0.5) * 14;
    }
    return data;
  }, []);

  useFrame((state) => {
    material.uTime = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

function ConcentricAisles() {
  return (
    <group position={[0, 0.25, 4]}>
      {[3.6, 5.2, 6.8, 8.4].map((radius, idx) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.08, 32, 180]} />
          <meshStandardMaterial
            color="#27272a"
            emissive="#6366f1"
            emissiveIntensity={0.28 + idx * 0.09}
            wireframe={idx % 2 === 0}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function AICoreSphere() {
  return (
    <Float speed={1.4} floatIntensity={0.3} rotationIntensity={0.2}>
      <group position={[0, 2.2, 4]}>
        <mesh castShadow>
          <sphereGeometry args={[1.2, 96, 96]} />
          <meshPhysicalMaterial
            color="#6366f1"
            metalness={0.8}
            roughness={0.08}
            transmission={0.16}
            clearcoat={1}
            iridescence={1}
            emissive="#4338ca"
            emissiveIntensity={1}
          />
        </mesh>
        {[0, 1, 2].map((ring) => (
          <mesh key={ring} rotation={[Math.PI / 2, ring * 0.6, 0]}>
            <torusGeometry args={[1.65 + ring * 0.26, 0.028, 16, 80]} />
            <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={0.75} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function HoverSpotlight({ target }: { target: [number, number, number] }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef(new THREE.Object3D());

  useFrame(() => {
    if (!lightRef.current) {
      return;
    }

    targetRef.current.position.set(target[0], target[1], target[2]);
    lightRef.current.position.set(target[0], 6, target[2] + 0.4);
    lightRef.current.target = targetRef.current;
    targetRef.current.updateMatrixWorld();
  });

  return (
    <>
      <primitive object={targetRef.current} />
      <spotLight
        ref={lightRef}
        intensity={2.1}
        angle={0.35}
        penumbra={0.6}
        color="#a5b4fc"
        position={[target[0], 6, target[2] + 0.4]}
      />
    </>
  );
}

export function EchoCanvasScene() {
  const shelves = useEchoEngineStore((state) => state.shelves);
  const selectedShelfId = useEchoEngineStore((state) => state.selectedShelfId);
  const setSelectedShelf = useEchoEngineStore((state) => state.setSelectedShelf);

  const [hoveredShelfId, setHoveredShelfId] = useState<string | null>(null);
  const sunRef = useRef<THREE.Mesh>(null!);

  const selectedShelf = shelves.find((shelf) => shelf.id === selectedShelfId);
  const hoveredShelf = shelves.find((shelf) => shelf.id === hoveredShelfId);

  const spotlightTarget: [number, number, number] = hoveredShelf?.position ?? [0, 0, 4];

  return (
    <div className="h-[calc(100vh-180px)] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas shadows camera={{ position: [0, 8.6, 13.5], fov: 40 }}>
        <Suspense fallback={null}>
          <color attach="background" args={["#09090b"]} />
          <fog attach="fog" args={["#09090b", 12, 26]} />

          <SceneLights urgent={Boolean(selectedShelf?.alert)} />
          <Environment preset="city" />

          <mesh ref={sunRef} position={[0, 8, -8]}>
            <sphereGeometry args={[0.7, 28, 28]} />
            <meshBasicMaterial color="#dbeafe" />
          </mesh>

          <AICoreSphere />
          <ConcentricAisles />
          <EchoTrails />

          {shelves.map((shelf) => (
            <group
              key={shelf.id}
              onPointerEnter={() => setHoveredShelfId(shelf.id)}
              onPointerLeave={() => setHoveredShelfId(null)}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedShelf(shelf.id);
              }}
            >
              <ShelfModel
                shelf={shelf}
                selected={shelf.id === selectedShelfId}
                hovered={shelf.id === hoveredShelfId}
              />
              <Text
                position={[shelf.position[0], 1.7, shelf.position[2]]}
                fontSize={0.14}
                color="#d4d4d8"
                outlineColor="#09090b"
                outlineWidth={0.008}
                anchorX="center"
              >
                ${Math.round(shelf.revenue)}
              </Text>
            </group>
          ))}

          <HoverSpotlight target={spotlightTarget} />

          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 4]}>
            <planeGeometry args={[26, 26]} />
            <meshStandardMaterial color="#101014" roughness={0.95} metalness={0.1} />
          </mesh>

          <CameraRig selectedShelfPosition={selectedShelf?.position} />

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.4} intensity={0.9} />
            <DepthOfField focusDistance={0.018} focalLength={0.02} bokehScale={1.8} height={540} />
            <GodRays sun={sunRef} samples={24} density={0.92} decay={0.95} weight={0.45} exposure={0.3} clampMax={1} />
          </EffectComposer>
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
