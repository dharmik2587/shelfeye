"use client";

import type { ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";

import { useIsMobile } from "@/lib/hooks/use-mobile";

interface SceneCanvasProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
  adaptive?: boolean;
}

export function SceneCanvas({ children, adaptive = true, dpr, gl, ...props }: SceneCanvasProps) {
  const isMobile = useIsMobile();

  const defaultDpr: [number, number] = isMobile ? [1, 1.15] : [1, 1.5];
  const glProps =
    typeof gl === "function"
      ? gl
      : {
          antialias: true,
          alpha: true,
          powerPreference: "high-performance" as const,
          ...(gl ?? {}),
        };

  return (
    <Canvas
      dpr={dpr ?? defaultDpr}
      gl={glProps}
      {...props}
    >
      {children}
      {adaptive && (
        <>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </>
      )}
    </Canvas>
  );
}
