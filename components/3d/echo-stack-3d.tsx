"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import { Environment, Float, Line } from "@react-three/drei";
import * as THREE from "three";

import { SceneCanvas } from "@/components/3d/scene-canvas";

const cardColors = ["#34d399", "#22d3ee", "#fb923c"];

function EchoStackInner() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(320 * 3);
    for (let i = 0; i < 320; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 1] = Math.random() * 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  const positions = useMemo(
    () => [
      new THREE.Vector3(-0.6, 0.4, 0),
      new THREE.Vector3(0, 0.9, -0.25),
      new THREE.Vector3(0.6, 1.4, 0.1),
    ],
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const targetRot = hovered ? 0.2 : 0.08;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot * Math.sin(t * 0.6), 0.08);
    groupRef.current.position.y = 0.08 * Math.sin(t * 1.1);
  });

  return (
    <>
      <color attach="background" args={["#0b0b0f"]} />
      <ambientLight intensity={0.55} color="#a5b4fc" />
      <directionalLight position={[4, 6, 4]} intensity={1.6} color="#c7d2fe" castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.8} color="#22d3ee" />

      <Float speed={1} floatIntensity={0.4} rotationIntensity={0.12}>
        <group
          ref={groupRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          position={[0, 0, 0]}
        >
          {positions.map((pos, idx) => (
            <mesh key={idx} position={pos.toArray()} castShadow receiveShadow>
              <boxGeometry args={[1.8, 1, 0.12]} />
              <meshPhysicalMaterial
                color={cardColors[idx]}
                metalness={0.4}
                roughness={0.15}
                clearcoat={1}
                clearcoatRoughness={0.12}
                transmission={0.08}
                emissive={cardColors[idx]}
                emissiveIntensity={hovered ? 0.75 : 0.45}
              />
            </mesh>
          ))}

          <Line
            points={positions}
            color="#7dd3fc"
            linewidth={hovered ? 2 : 1}
            transparent
            opacity={hovered ? 0.9 : 0.45}
          />
        </group>
      </Float>

      {/* Subtle echo particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#6366f1" size={0.025} sizeAttenuation opacity={0.25} transparent />
      </points>

      <Environment preset="city" />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.35} intensity={hovered ? 1 : 0.7} />
        <DepthOfField focusDistance={0.015} focalLength={0.02} bokehScale={1.6} height={480} />
      </EffectComposer>
    </>
  );
}

export function EchoStack3D() {
  return (
    <SceneCanvas camera={{ position: [0, 1.6, 4.2], fov: 38 }} shadows dpr={[1, 1.35]} gl={{ antialias: true }}>
      <EchoStackInner />
    </SceneCanvas>
  );
}
