import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext.tsx';

export const TopographicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Resizing clears the canvas; with reduced motion there is no loop to repaint it.
      if (prefersReducedMotion) {
        lastDraw = 0;
        draw();
      }
    };

    window.addEventListener('resize', handleResize);

    let t = 0;
    const lines = 65; // Number of contour lines across the screen

    // The waves drift very slowly, so 30fps looks identical to 60fps at half the cost
    // of redrawing (and re-compositing) a full-screen canvas.
    const FRAME_MS = 1000 / 30;
    let lastDraw = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = (now: number = performance.now()) => {
      if (now - lastDraw < FRAME_MS - 1) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;

      const isDark = themeRef.current === 'dark';
      ctx.fillStyle = isDark ? '#030804' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      t += 0.006;

      for (let i = 0; i < lines; i++) {
        const lineFraction = i / lines;
        const baseY = height * 0.1 + lineFraction * height * 0.9;
        
        ctx.beginPath();
        if (isDark) {
          ctx.strokeStyle = `rgba(0, 255, 102, ${0.07 + (i % 3 === 0 ? 0.09 : 0.04)})`;
        } else {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.09 + (i % 3 === 0 ? 0.08 : 0.04)})`;
        }
        ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.8;

        for (let x = 0; x <= width; x += 15) {
          const nx = x / width;
          // Harmonic wave simulation mimicking Perlin elevation contours
          const wave1 = Math.sin(nx * 4.5 + t + i * 0.15) * 45;
          const wave2 = Math.cos(nx * 2.2 - t * 0.8 + i * 0.25) * 35;
          const wave3 = Math.sin((nx * 7.0) + (i * 0.08) + t * 1.5) * 20;
          
          // Mountainous crest in upper-center & lower sides
          const centerWeight = Math.exp(-Math.pow((nx - 0.45) * 2.8, 2));
          const elevation = (wave1 + wave2 + wave3) * (0.8 + centerWeight * 1.8);

          const y = baseY + elevation;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      if (!prefersReducedMotion) animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};
