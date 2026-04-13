"use client";

import { useEffect, useState } from "react";

interface SpringCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function SpringCounter({ value, suffix = "", prefix = "", decimals = 0 }: SpringCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 900;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
