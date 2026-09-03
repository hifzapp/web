"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface HeartProps {
  size?: number;
  broken?: boolean;
  onComplete?: () => void;
}

export default function Heart({
  size = 32,
  broken = false,
  onComplete,
}: HeartProps) {
  const heartRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const heart = heartRef.current;

    if (!heart || !broken) return;

    const ctx = gsap.context(() => {
      const paths = heart.querySelectorAll("path");

      gsap.killTweensOf([heart, paths]);

      const tl = gsap.timeline({
        onComplete,
      });

      tl.to(heart, {
        keyframes: [
          { x: -2, rotation: -4, duration: 0.07 },
          { x: 3, rotation: 4, duration: 0.07 },
          { x: -3, rotation: -3, duration: 0.07 },
          { x: 2, rotation: 2, duration: 0.07 },
          { x: 0, rotation: 0, duration: 0.08 },
        ],
        transformOrigin: "center center",
        ease: "power1.inOut",
      })
        .to(
          paths[0],
          {
            x: -5,
            rotation: -5,
            duration: 0.35,
            ease: "power2.out",
          },
          "-=0.05",
        )
        .to(
          paths[1],
          {
            x: 5,
            rotation: 5,
            duration: 0.35,
            ease: "power2.out",
          },
          "<",
        )
        .to(
          heart,
          {
            scale: 0.85,
            opacity: 0.75,
            duration: 0.25,
            ease: "power2.out",
          },
          "<",
        )
        .to(heart, {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: "back.out(2)",
        })
        .to(
          paths,
          {
            x: 0,
            rotation: 0,
            duration: 0.35,
            ease: "power2.out",
          },
          "<",
        );
    }, heart);

    return () => ctx.revert();
  }, [broken, onComplete]);

  return (
    <svg
      ref={heartRef}
      width={size}
      height={size}
      viewBox="0 -5.37 77.646 77.646"
      xmlns="http://www.w3.org/2000/svg"
      className="block origin-center"
    >
      <defs>
        <linearGradient
          id="heart-gradient"
          x1="1.044"
          y1="0.005"
          x2="0.413"
          y2="0.749"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#ff7471" />
          <stop offset="1" stopColor="#ff5245" />
        </linearGradient>
      </defs>

      <g transform="translate(-263.982 -435.283)">
        <path
          d="M302.81 446.03c-.059-.106-.128-.2-.187-.307.059.1.128.2.187.307Z"
          fill="none"
        />

        <path
          d="M341.628 456.395l-.025-.006c.006-.142.025-.279.025-.431a20.662 20.662 0 0 0-37.039-12.611.171.171 0 0 0-.024-.007 2.169 2.169 0 0 1-3.54-.046l-.035.008a20.657 20.657 0 0 0-37 12.656c0 .147.018.282.018.424l-.029.013s0 .5.1 1.413a20.552 20.552 0 0 0 .6 3.364c1.608 6.945 6.938 20.286 24.659 32.122 10.242 6.879 12.73 8.743 13.383 8.867.031.006.048.033.083.033s.058-.033.094-.043c.7-.162 3.265-2.071 13.359-8.857 16.931-11.313 22.555-24 24.428-31.163a20.743 20.743 0 0 0 .854-4.546c.112-.793.117-1.222.117-1.222ZM302.81 446.03h0c-.059-.1-.128-.2-.187-.307.059.105.128.204.187.307Z"
          fill="#ff5245"
        />

        <path
          d="M295.337 474.437c-5.407-20.228 1.411-28.894 5-31.889a20.747 20.747 0 0 0-6.426-5.077c-6.5-1.416-15.583.295-21.458 16.921-1 3.4-1.458 11.938-.492 22.426a65.334 65.334 0 0 0 17.38 16.476c10.242 6.879 12.73 8.743 13.383 8.867.031.006.048.033.083.033s.058-.033.094-.043a2.946 2.946 0 0 0 .76-.373c-1.972-6.348-4.821-15.171-8.232-27.314Z"
          fill="url(#heart-gradient)"
        />
      </g>
    </svg>
  );
}
