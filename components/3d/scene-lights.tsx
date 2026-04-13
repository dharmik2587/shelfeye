"use client";

interface SceneLightsProps {
  urgent?: boolean;
  theme?: "dark" | "light";
}

export function SceneLights({ urgent = false, theme = "dark" }: SceneLightsProps) {
  const tint = urgent ? "#fb7185" : theme === "dark" ? "#818cf8" : "#7c3aed";

  return (
    <>
      <ambientLight intensity={theme === "dark" ? 0.46 : 0.7} color={urgent ? "#fda4af" : "#dbeafe"} />
      <directionalLight
        castShadow
        intensity={2.1}
        color={tint}
        position={[8, 10, 8]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight intensity={0.85} color="#a5b4fc" position={[-6, 5, -8]} />
      <pointLight intensity={1.1} color={urgent ? "#fb7185" : "#22d3ee"} position={[0, 4, 0]} />
    </>
  );
}
