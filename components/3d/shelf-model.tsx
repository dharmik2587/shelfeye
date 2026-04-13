"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";

import type { Shelf } from "@/lib/stores/echo-engine-store";
import { useOptionalTexture } from "@/lib/hooks/use-optional-texture";

interface ShelfModelProps {
  shelf: Shelf;
  selected?: boolean;
  hovered?: boolean;
}

export function ShelfModel({ shelf, selected, hovered }: ShelfModelProps) {
  const groupRef = useRef<Group>(null);
  const woodDiffuse = useOptionalTexture("/textures/wood/wood-diffuse.jpg", {
    colorSpace: THREE.SRGBColorSpace,
  });
  const woodNormal = useOptionalTexture("/textures/wood/wood-normal.jpg");

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    const targetScale = selected ? 1.12 : hovered ? 1.06 : 1;
    groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * delta * 10;
    groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * delta * 10;
    groupRef.current.scale.z += (targetScale - groupRef.current.scale.z) * delta * 10;
  });

  const barColor =
    shelf.stockLevel > 55 ? "#4ade80" : shelf.stockLevel > 30 ? "#fbbf24" : "#fb7185";

  return (
    <group ref={groupRef} position={shelf.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.65, 1.1, 0.75]} />
        <meshPhysicalMaterial
          map={woodDiffuse ?? undefined}
          normalMap={woodNormal ?? undefined}
          roughness={0.64}
          metalness={0.08}
          clearcoat={0.2}
          color="#9d7f65"
        />
      </mesh>

      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.2, Math.max(0.16, shelf.stockLevel / 100), 0.2]} />
        <meshStandardMaterial emissive={barColor} emissiveIntensity={0.7} color={barColor} />
      </mesh>
    </group>
  );
}
