"use client";

import { Text, Float } from "@react-three/drei";
import { SceneCanvas } from "@/components/3d/scene-canvas";

export function FloatingGreeting3D() {
  return (
    <div className="h-40 w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/65">
      <SceneCanvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.2]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 2, 2]} intensity={1.4} color="#818cf8" />
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.56}
            color="#e5e7eb"
            anchorX="center"
            anchorY="middle"
          >
            Good morning, Alex
          </Text>
        </Float>
      </SceneCanvas>
    </div>
  );
}
