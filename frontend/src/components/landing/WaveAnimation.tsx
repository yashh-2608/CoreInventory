'use client';

import React, { useEffect, useRef } from 'react';

export const WaveAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w: number, h: number;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    });

    const waves = Array.from({ length: 3 }, (_, i) => ({
      y: h / 2,
      length: 0.01,
      amplitude: 50 + i * 20,
      frequency: 0.01 + i * 0.005,
      phase: i * Math.PI / 2,
    }));

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, w, h);

      waves.forEach((wave, i) => {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);

        for (let x = 0; x < w; x++) {
          const distance = Math.abs(x - mouse.current.x);
          const mouseFactor = Math.max(0, 1 - distance / 500);
          
          const y = h / 2 + 
            Math.sin(x * wave.length + wave.phase) * 
            (wave.amplitude + mouseFactor * 50);
            
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = i === 0 ? 'rgba(59, 130, 246, 0.5)' : 
                          i === 1 ? 'rgba(147, 51, 234, 0.4)' : 
                                   'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        wave.phase += wave.frequency;
      });
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-[#020617]"
    />
  );
};
