"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

export function useOptionalTexture(
  url: string,
  options?: {
    colorSpace?: THREE.ColorSpace;
  },
) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();

    loader.load(
      url,
      (nextTexture) => {
        if (!active) {
          return;
        }

        if (options?.colorSpace) {
          nextTexture.colorSpace = options.colorSpace;
        }
        setTexture(nextTexture);
      },
      undefined,
      () => {
        if (!active) {
          return;
        }
        setTexture(null);
      },
    );

    return () => {
      active = false;
    };
  }, [url, options?.colorSpace]);

  return texture;
}
