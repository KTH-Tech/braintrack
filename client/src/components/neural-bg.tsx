import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  drift: number;
  color: string;
}

const NEON_HUES = [
  "rgba(255,255,255,1)",
  "rgba(255,255,255,1)",
  "rgba(255,255,255,1)",
  "rgba(6,182,212,1)",   // cyan
  "rgba(236,72,153,1)",  // pink
  "rgba(59,130,246,1)",  // blue
  "rgba(34,197,94,1)",   // green
  "rgba(249,115,22,1)",  // orange
  "rgba(250,204,21,1)",  // gold
];

export function NeuralBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background is fully static — only .anicon-* academic icons animate.
    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const buildStars = () => {
      const target = Math.min(180, Math.floor((canvas.width * canvas.height) / 14000));
      stars = [];
      for (let i = 0; i < target; i++) {
        const baseAlpha = Math.random() * 0.55 + 0.15;
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.4 + 0.3,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: 0,
          twinklePhase: 0,
          drift: 0,
          color: NEON_HUES[Math.floor(Math.random() * NEON_HUES.length)],
        });
      }
    };

    const drawOnce = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const a = Math.max(0.05, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color.replace(",1)", `,${a.toFixed(3)})`);
        ctx.shadowColor = s.color.replace(",1)", `,${(a * 0.6).toFixed(3)})`);
        ctx.shadowBlur = s.r > 1 ? 6 : 3;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    resize();
    buildStars();
    drawOnce();

    const onResize = () => {
      resize();
      buildStars();
      drawOnce();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 0 }}
    />
  );
}

export function CosmicBackground() {
  return null;
}
