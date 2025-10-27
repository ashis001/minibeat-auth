import { useRef, useEffect } from "react";

// This component renders a single horizontal arrow with animated particles
// moving along its length, giving the illusion of current flow.
export default function FlowingArrow({
  width = 400,
  height = 80,
  arrowColor = "#00E5FF",
  particleColor = "#00E5FF",
  particleCount = 30,
  bgColor = "transparent",
}: {
  width?: number | string;
  height?: number | string;
  arrowColor?: string;
  particleColor?: string;
  particleCount?: number;
  bgColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particles = useRef<{ x: number; speed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const w = (canvas.width = typeof width === "number" ? width : 400);
    const h = (canvas.height = typeof height === "number" ? height : 80);

    // Initialize particle positions along the line
    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (w - 60) + 30,
      speed: 1 + Math.random() * 2,
    }));

    const drawArrow = () => {
      ctx.strokeStyle = arrowColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(20, h / 2);
      ctx.lineTo(w - 40, h / 2);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(w - 40, h / 2);
      ctx.lineTo(w - 60, h / 2 - 10);
      ctx.lineTo(w - 60, h / 2 + 10);
      ctx.closePath();
      ctx.fillStyle = arrowColor;
      ctx.fill();
    };

    const drawParticles = () => {
      for (let p of particles.current) {
        ctx.beginPath();
        ctx.arc(p.x, h / 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      drawArrow();
      drawParticles();

      // Move particles from left to right along the arrow
      for (let p of particles.current) {
        p.x += p.speed;
        if (p.x > w - 60) p.x = 30; // reset when reaching arrow head
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height, particleCount, arrowColor, particleColor, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width, height, background: bgColor }}
    />
  );
}
