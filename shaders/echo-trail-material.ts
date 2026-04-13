"use client";

import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const EchoTrailMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color("#6366f1"),
    uColorB: new THREE.Color("#22d3ee"),
  },
  /* glsl */ `
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.y += sin((uv.x * 16.0) + uTime * 1.25) * 0.07;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* glsl */ `
    varying vec2 vUv;
    uniform vec3 uColorA;
    uniform vec3 uColorB;

    void main() {
      float glow = smoothstep(0.0, 1.0, sin(vUv.x * 14.0) * 0.5 + 0.5);
      vec3 color = mix(uColorA, uColorB, glow * vUv.y);
      gl_FragColor = vec4(color, 0.72 * (1.0 - abs(vUv.y - 0.5) * 1.35));
    }
  `,
);

export { EchoTrailMaterialImpl };
