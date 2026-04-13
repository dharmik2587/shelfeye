"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  OrbitControls,
  PerformanceMonitor,
} from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, GodRays } from "@react-three/postprocessing";
import * as THREE from "three";
import { useOptionalTexture } from "@/lib/hooks/use-optional-texture";
import { SceneCanvas } from "@/components/3d/scene-canvas";

function LowPolyStore() {
  const groupRef = useRef<THREE.Group>(null);
  const woodDiffuse = useOptionalTexture("/textures/wood/wood-diffuse.jpg", {
    colorSpace: THREE.SRGBColorSpace,
  });
  const woodNormal = useOptionalTexture("/textures/wood/wood-normal.jpg");

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }
    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#19191f" roughness={0.95} metalness={0.05} />
      </mesh>

      {Array.from({ length: 12 }).map((_, idx) => {
        const x = (idx % 4) * 2.4 - 3.6;
        const z = Math.floor(idx / 4) * 2.4 - 2.4;
        return (
          <mesh key={idx} position={[x, -0.25, z]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.6, 0.8]} />
            <meshPhysicalMaterial
              map={woodDiffuse ?? undefined}
              normalMap={woodNormal ?? undefined}
              roughness={0.65}
              metalness={0.08}
              clearcoat={0.2}
              color="#9a7b62"
            />
          </mesh>
        );
      })}
    </group>
  );
}

function EchoParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const positions = useMemo(() => {
    const data = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 18;
      data[i * 3 + 1] = Math.random() * 5 - 1;
      data[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.y += 0.0008;
    pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, mouse.x * 0.9, 0.04);
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, mouse.y * 0.4, 0.04);

    const attrs = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < attrs.count; i += 3) {
      attrs.array[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.0003;
    }
    attrs.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#6366f1" size={0.025} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function AuthSceneContent() {
  const sunRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      <ambientLight intensity={0.55} color="#a5b4fc" />
      <directionalLight
        castShadow
        intensity={2.4}
        color="#c7d2fe"
        position={[8, 8, 5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight intensity={1.4} color="#6366f1" position={[-4, 3, -3]} />

      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.45}>
        <LowPolyStore />
      </Float>
      <EchoParticles />

      <mesh ref={sunRef} position={[0, 4, -4]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#dbeafe" />
      </mesh>

      <Environment preset="warehouse" />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={Math.PI / 3.2}
        dampingFactor={0.06}
        enableDamping
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.6} intensity={0.7} />
        <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={1.5} height={480} />
        <GodRays sun={sunRef} samples={24} density={0.92} decay={0.95} weight={0.5} exposure={0.3} clampMax={1} />
      </EffectComposer>
    </>
  );
}

export function AuthBackgroundScene() {
  return (
    <SceneCanvas shadows camera={{ position: [7, 4, 10], fov: 42 }}>
      <PerformanceMonitor ms={250} iterations={20}>
        <Suspense fallback={null}>
          <AuthSceneContent />
        </Suspense>
      </PerformanceMonitor>
    </SceneCanvas>
  );
}
