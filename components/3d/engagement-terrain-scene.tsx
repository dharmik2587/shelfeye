"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneCanvas } from "@/components/3d/scene-canvas";

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 6, 64, 48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 1.7) * 0.3 + Math.cos(y * 1.4) * 0.4;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2.7, 0, 0]}>
      <meshStandardMaterial color="#1e1b4b" emissive="#312e81" emissiveIntensity={0.45} wireframe={false} />
    </mesh>
  );
}

function DwellParticles() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const points = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i += 1) {
      points[i * 3] = (Math.random() - 0.5) * 8;
      points[i * 3 + 1] = Math.random() * 2;
      points[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return points;
  }, []);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#818cf8" size={0.06} opacity={0.7} transparent />
    </points>
  );
}

export function EngagementTerrainScene() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas camera={{ position: [0, 3.5, 7], fov: 44 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.62} />
          <directionalLight intensity={1.5} color="#a5b4fc" position={[4, 5, 3]} />
          <Terrain />
          <DwellParticles />
        </Suspense>
      </SceneCanvas>
    </div>
  );
}
