"use client";

import { useEffect, type CSSProperties } from "react";

const colors = ["#e9c28e", "#d8a7c7", "#ffffff", "#b990b6", "#f2d8a8", "#d27d93"];

export default function CouponCrackers({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onComplete, 4000);
    return () => window.clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="coupon-crackers" aria-hidden="true">
      {Array.from({ length: 42 }, (_, index) => {
        const burst = index % 3;
        const angle = ((index * 137.5) % 360) * (Math.PI / 180);
        const radius = 48 + ((index * 17) % 72);
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        const originX = [18, 50, 82][burst];
        const originY = [40, 29, 42][burst];
        return (
          <span
            key={index}
            className={`coupon-crackers__piece ${index % 4 === 0 ? "coupon-crackers__piece--round" : ""}`}
            style={{
              "--origin-x": `${originX}%`,
              "--origin-y": `${originY}%`,
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              "--spin": `${(index * 97) % 620 - 310}deg`,
              "--color": colors[index % colors.length],
              "--delay": `${(index % 6) * 0.055}s`,
              "--size": `${5 + (index % 4) * 2}px`,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
