import React, { useEffect, useRef } from 'react';

interface VibeAnimationEngineProps {
  vibe: string | null;
  trigger: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  extra?: any;
}

export const VibeAnimationEngine: React.FC<VibeAnimationEngineProps> = ({ vibe, trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  const initParticles = (canvasWidth: number, canvasHeight: number) => {
    if (!vibe) return;

    const particles: Particle[] = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    switch (vibe) {
      case 'CUTE':
        // Pulsing hearts rising from the bottom half of the screen
        for (let i = 0; i < 35; i++) {
          particles.push({
            x: Math.random() * canvasWidth,
            y: canvasHeight + 20 + Math.random() * 200,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.5 - Math.random() * 2,
            size: 12 + Math.random() * 16,
            color: i % 2 === 0 ? '#ff69b4' : '#ff1493', // Pink & Hot Pink
            alpha: 0.8 + Math.random() * 0.2,
            life: 0,
            maxLife: 200 + Math.random() * 150,
            rotation: (Math.random() - 0.5) * 0.5,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            extra: {
              phase: Math.random() * Math.PI * 2,
              speed: 0.02 + Math.random() * 0.03,
              amplitude: 20 + Math.random() * 30
            }
          });
        }
        break;

      case 'BEAUTIFUL':
        // Majestic shimmering golden stars spinning and floating
        for (let i = 0; i < 45; i++) {
          particles.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.2,
            size: 8 + Math.random() * 12,
            color: i % 2 === 0 ? '#ffd700' : '#fff8dc', // Gold & Silk Corn
            alpha: 0.2 + Math.random() * 0.8,
            life: 0,
            maxLife: 150 + Math.random() * 150,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.01 + Math.random() * 0.03,
            extra: {
              pulseSpeed: 0.03 + Math.random() * 0.04,
              pulsePhase: Math.random() * Math.PI * 2
            }
          });
        }
        break;

      case 'FUNKY':
        // Glitchy bouncing geometric neon shapes
        for (let i = 0; i < 30; i++) {
          const shapes = ['circle', 'triangle', 'square', 'ring'];
          particles.push({
            x: centerX + (Math.random() - 0.5) * 150,
            y: centerY + (Math.random() - 0.5) * 150,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            size: 15 + Math.random() * 25,
            color: i % 3 === 0 ? '#00ff88' : (i % 3 === 1 ? '#ff007f' : '#00bfff'), // Neon Green, Hot Pink, Cyan
            alpha: 1.0,
            life: 0,
            maxLife: 80 + Math.random() * 60,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            extra: {
              shape: shapes[Math.floor(Math.random() * shapes.length)],
              lineWidth: 3 + Math.random() * 2
            }
          });
        }
        break;

      case 'ANIME':
        // Comic action lines bursting outwards + rotating star impacts
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 15 + Math.random() * 20;
          particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 5,
            color: i % 4 === 0 ? '#000000' : (i % 4 === 1 ? '#ffffff' : (i % 4 === 2 ? '#ff0055' : '#ffff00')), // Black, White, Red, Yellow
            alpha: 0.9,
            life: 0,
            maxLife: 35 + Math.random() * 20,
            rotation: angle,
            rotationSpeed: 0,
            extra: {
              type: i % 4 === 0 ? 'line' : 'star',
              length: 40 + Math.random() * 80
            }
          });
        }
        break;

      case 'COLORFUL':
        // Exploding multi-colored confetti drifting down
        for (let i = 0; i < 110; i++) {
          const angle = Math.random() * Math.PI * 2;
          const force = 3 + Math.random() * 12;
          const colors = ['#ff0055', '#00ff66', '#0099ff', '#ffcc00', '#ff00ff', '#9900ff', '#ff6600'];
          particles.push({
            x: centerX,
            y: centerY - 100,
            vx: Math.cos(angle) * force,
            vy: Math.sin(angle) * force - 3,
            size: 6 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1.0,
            life: 0,
            maxLife: 120 + Math.random() * 80,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
            extra: {
              gravity: 0.2,
              scaleX: 1.0,
              scaleYSpeed: 0.05 + Math.random() * 0.08,
              scaleYPhase: Math.random() * Math.PI
            }
          });
        }
        break;

      case 'OLD_MONEY':
        // Luxury gold coins and diamonds raining down with spinning scaling
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * canvasWidth,
            y: -50 - Math.random() * 150,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 2.0 + Math.random() * 3,
            size: 14 + Math.random() * 10,
            color: '#ffd700', // Gold
            alpha: 1.0,
            life: 0,
            maxLife: 250 + Math.random() * 100,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.02 + Math.random() * 0.04,
            extra: {
              scaleX: 1.0,
              spinSpeed: 0.05 + Math.random() * 0.08,
              isDiamond: i % 3 === 0
            }
          });
        }
        break;
    }

    particlesRef.current = particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    initParticles(canvas.width, canvas.height);

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) => {
      c.save();
      c.globalAlpha = alpha;
      c.beginPath();
      c.translate(x, y);
      c.moveTo(0, 0);
      c.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
      c.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
      c.fillStyle = color;
      c.fill();
      c.restore();
    };

    const drawStar = (c: CanvasRenderingContext2D, x: number, y: number, spikes: number, outerRadius: number, innerRadius: number, color: string, alpha: number, rotation: number) => {
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);
      c.rotate(rotation);
      c.beginPath();
      let rot = (Math.PI / 2) * 3;
      let cx = 0;
      let cy = 0;
      const step = Math.PI / spikes;

      c.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        cx = Math.cos(rot) * outerRadius;
        cy = Math.sin(rot) * outerRadius;
        c.lineTo(cx, cy);
        rot += step;

        cx = Math.cos(rot) * innerRadius;
        cy = Math.sin(rot) * innerRadius;
        c.lineTo(cx, cy);
        rot += step;
      }
      c.lineTo(0, -outerRadius);
      c.closePath();
      c.fillStyle = color;
      c.fill();
      c.restore();
    };

    const drawCoin = (c: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, scaleX: number) => {
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);
      c.scale(scaleX, 1);
      
      // Outer rim
      c.beginPath();
      c.arc(0, 0, size, 0, Math.PI * 2);
      c.fillStyle = '#ffd700';
      c.strokeStyle = '#d4af37'; // metallic gold border
      c.lineWidth = 2;
      c.fill();
      c.stroke();
      
      // Inner circle
      c.beginPath();
      c.arc(0, 0, size * 0.7, 0, Math.PI * 2);
      c.strokeStyle = '#b8860b';
      c.lineWidth = 1;
      c.stroke();

      // Rupee symbol
      c.font = `900 ${size * 0.9}px sans-serif`;
      c.fillStyle = '#996515';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('₹', 0, 0);
      c.restore();
    };

    const drawDiamond = (c: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, rotation: number) => {
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);
      c.rotate(rotation);
      c.beginPath();
      c.moveTo(0, -size);
      c.lineTo(size * 0.8, 0);
      c.lineTo(0, size);
      c.lineTo(-size * 0.8, 0);
      c.closePath();
      c.fillStyle = '#e4f6f8';
      c.strokeStyle = '#82cae2';
      c.lineWidth = 1.5;
      c.fill();
      c.stroke();
      c.restore();
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Apply physics based on Vibe
        if (vibe === 'CUTE') {
          // Swaying heart physics
          p.x += p.vx + Math.sin(p.life * p.extra.speed + p.extra.phase) * 0.4;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          // Fade out near end of life
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        } 
        else if (vibe === 'BEAUTIFUL') {
          // Slow floating shimmer
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          // Shimmer/twinkle effect
          p.alpha = Math.max(0, (0.3 + Math.sin(p.life * p.extra.pulseSpeed + p.extra.pulsePhase) * 0.6) * (1 - p.life / p.maxLife));
        } 
        else if (vibe === 'FUNKY') {
          // Bouncy physics
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          // Bounce off boundaries
          if (p.x - p.size < 0 || p.x + p.size > canvas.width) p.vx *= -1;
          if (p.y - p.size < 0 || p.y + p.size > canvas.height) p.vy *= -1;
        } 
        else if (vibe === 'ANIME') {
          // Speed burst out
          p.x += p.vx;
          p.y += p.vy;
          // Fast fade
          p.alpha = Math.max(0, 1.0 - (p.life / p.maxLife) ** 1.5);
        }
        else if (vibe === 'COLORFUL') {
          // Falling gravity confetti
          p.vy += p.extra.gravity;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          // Spin simulation
          p.extra.scaleX = Math.sin(p.life * p.extra.scaleYSpeed + p.extra.scaleYPhase);
        }
        else if (vibe === 'OLD_MONEY') {
          // Gold rain
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          // Horizontal spinning
          p.extra.scaleX = Math.sin(p.life * p.extra.spinSpeed);
        }

        // Draw particle
        if (vibe === 'CUTE') {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.alpha);
        } 
        else if (vibe === 'BEAUTIFUL') {
          drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.25, p.color, p.alpha, p.rotation);
        } 
        else if (vibe === 'FUNKY') {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.fillStyle = p.color + '22'; // low opacity fill
          ctx.lineWidth = p.extra.lineWidth;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.extra.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.extra.shape === 'ring') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
            ctx.stroke();
          } else if (p.extra.shape === 'square') {
            ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
            ctx.strokeRect(-p.size, -p.size, p.size * 2, p.size * 2);
          } else if (p.extra.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size, p.size);
            ctx.lineTo(-p.size, p.size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        } 
        else if (vibe === 'ANIME') {
          if (p.extra.type === 'line') {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            // Draw speed line backwards along direction of travel
            const dirX = p.vx / Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const dirY = p.vy / Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            ctx.lineTo(p.x - dirX * p.extra.length * 0.8, p.y - dirY * p.extra.length * 0.8);
            ctx.stroke();
            ctx.restore();
          } else {
            // Impact pop star
            drawStar(ctx, p.x, p.y, 5, p.size * 3, p.size * 1.2, p.color, p.alpha, p.life * 0.05);
          }
        }
        else if (vibe === 'COLORFUL') {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.extra.scaleX, 1);
          // Rectangular confetti
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
          ctx.restore();
        }
        else if (vibe === 'OLD_MONEY') {
          if (p.extra.isDiamond) {
            drawDiamond(ctx, p.x, p.y, p.size * 0.8, p.alpha, p.rotation);
          } else {
            drawCoin(ctx, p.x, p.y, p.size, p.alpha, p.extra.scaleX);
          }
        }
      }

      if (particles.length > 0) {
        animationRef.current = requestAnimationFrame(update);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [vibe, trigger]);

  if (!vibe) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9995,
      }}
    />
  );
};
