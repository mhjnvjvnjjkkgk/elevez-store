import React, { useState, useEffect, useRef } from 'react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { audioService } from '../../services/audioService';
import { Zap, Timer, Award, Gift, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slice {
  label: string;
  type: 'points' | 'discount' | 'empty';
  value: number | string;
  color: string;
}

const SLICES: Slice[] = [
  { label: '50 PTS', type: 'points', value: 50, color: '#FF007F' }, // Cyber Pink
  { label: '10% OFF', type: 'discount', value: 'SPIN10', color: '#000000' }, // Void Black
  { label: '100 PTS', type: 'points', value: 100, color: '#00ff88' }, // Accent Green
  { label: 'TRY AGAIN', type: 'empty', value: 0, color: '#333333' }, // Gray
  { label: '250 PTS', type: 'points', value: 250, color: '#FF007F' }, // Cyber Pink
  { label: 'FREE SHIP', type: 'discount', value: 'FREESHIP', color: '#00ff88' }, // Accent Green
  { label: '500 PTS!', type: 'points', value: 500, color: '#00ffff' }, // Vapor Blue
  { label: 'MYSTERY', type: 'discount', value: 'MYSTERYSTICK', color: '#ff7e40' } // Orange
];

export const LuckySpinWheel: React.FC = () => {
  const { profile, awardCustomPoints, redeemPoints, refresh } = useLoyalty();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<Slice | null>(null);
  const [canSpinFree, setCanSpinFree] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  
  const currentAngleRef = useRef(0);
  const spinTimeRef = useRef(0);
  const spinTimeTotalRef = useRef(0);
  const spinAngleStartRef = useRef(0);
  const lastSegmentRef = useRef(-1);

  // Check spin limits from localStorage
  useEffect(() => {
    const checkLimit = () => {
      try {
        const lastSpin = localStorage.getItem(`elevez_last_spin_${profile?.userId || 'guest'}`);
        if (lastSpin) {
          const hoursPassed = (Date.now() - parseInt(lastSpin)) / (1000 * 60 * 60);
          if (hoursPassed < 24) {
            setCanSpinFree(false);
            return;
          }
        }
        setCanSpinFree(true);
      } catch {
        setCanSpinFree(true);
      }
    };

    checkLimit();
  }, [profile]);

  // Initial draw
  useEffect(() => {
    drawWheel(0);
  }, []);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / SLICES.length;

    ctx.clearRect(0, 0, size, size);

    // Draw slices
    SLICES.forEach((slice, i) => {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.fillStyle = slice.color;
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.lineTo(center, center);
      ctx.fill();

      // Outer border for slice
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = slice.color === '#FFFFFF' || slice.color === '#00ff88' || slice.color === '#00ffff' || slice.color === '#ff7e40' ? '#000000' : '#FFFFFF';
      ctx.font = 'black 12px "Courier New", Courier, monospace';
      
      // Draw label rotated
      ctx.fillText(slice.label, radius - 20, 5);
      ctx.restore();
    });

    // Center peg/cap
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00ff88';
    ctx.stroke();

    // Small star in center
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', center, center);
  };

  const easeOut = (t: number, b: number, c: number, d: number): number => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
  };

  const tickSoundTrigger = (angle: number) => {
    const sliceAngle = (2 * Math.PI) / SLICES.length;
    const currentAngleNormalized = angle % (2 * Math.PI);
    const activeSegment = Math.floor((2 * Math.PI - currentAngleNormalized) / sliceAngle) % SLICES.length;
    
    if (activeSegment !== lastSegmentRef.current) {
      audioService.playWheelTick();
      lastSegmentRef.current = activeSegment;
    }
  };

  const animateWheel = () => {
    spinTimeRef.current += 30;
    if (spinTimeRef.current >= spinTimeTotalRef.current) {
      stopRotateWheel();
      return;
    }

    const spinAngle = spinAngleStartRef.current - easeOut(spinTimeRef.current, 0, spinAngleStartRef.current, spinTimeTotalRef.current);
    currentAngleRef.current += (spinAngle * Math.PI) / 180;
    
    drawWheel(currentAngleRef.current);
    tickSoundTrigger(currentAngleRef.current);
    
    requestAnimationFrame(animateWheel);
  };

  const stopRotateWheel = () => {
    setSpinning(false);
    const sliceAngle = (2 * Math.PI) / SLICES.length;
    
    // Calculate final segment pointed at (pointer is at top: 3 * Math.PI / 2 or top-right)
    // The pointer is at 12 o'clock, which is -Math.PI / 2
    const currentAngleNormalized = currentAngleRef.current % (2 * Math.PI);
    
    // Math to get target segment from pointer
    let pointerAngle = 1.5 * Math.PI; // 12 o'clock
    let relativeAngle = pointerAngle - currentAngleNormalized;
    if (relativeAngle < 0) relativeAngle += 2 * Math.PI;
    
    const winningIndex = Math.floor(relativeAngle / sliceAngle) % SLICES.length;
    const won = SLICES[winningIndex];

    setSpinResult(won);
    audioService.playSuccess();
    
    // Process winning actions
    if (won.type === 'points') {
      const pts = won.value as number;
      if (profile) {
        awardCustomPoints(pts, `Lucky Wheel Reward: ${won.label}`)
          .then(() => refresh())
          .catch(err => console.error('Error awarding points:', err));
        setMessage(`⚡ Jackpot! Added +${pts} PTS to your profile.`);
      } else {
        setMessage(`⚡ Added +${pts} PTS to your local profile.`);
      }
    } else if (won.type === 'discount') {
      const promo = won.value as string;
      setMessage(`🎉 Unlocked Discount Code: [${promo}] (Copied to clipboard!)`);
      try {
        navigator.clipboard.writeText(promo);
      } catch (e) {
        console.warn('Clipboard write block:', e);
      }
    } else {
      setMessage('😅 Better luck tomorrow! Claim your next spin in 24h.');
    }
  };

  const handleSpinClick = async () => {
    if (spinning) return;
    
    // Check if free or needs points
    if (!canSpinFree) {
      if (!profile || profile.points < 50) {
        setMessage('❌ Insufficient Points! Spins cost 50 PTS.');
        return;
      }
      
      // Deduct points
      try {
        await redeemPoints(50, 0); // custom points cost
        refresh();
      } catch (err: any) {
        setMessage(`❌ Points deduction failed: ${err.message}`);
        return;
      }
    } else {
      // Record free spin usage
      try {
        localStorage.setItem(`elevez_last_spin_${profile?.userId || 'guest'}`, Date.now().toString());
        setCanSpinFree(false);
      } catch (e) {
        console.warn('Localstorage write error:', e);
      }
    }

    setSpinResult(null);
    setMessage(null);
    setSpinning(true);

    spinAngleStartRef.current = Math.random() * 10 + 10;
    spinTimeRef.current = 0;
    spinTimeTotalRef.current = Math.random() * 2000 + 3000;
    
    animateWheel();
  };

  useEffect(() => {
    setMessage('⚠️ Daily spin is temporarily deactivated.');
  }, []);

  return (
    <div className="bg-black text-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#666] max-w-md mx-auto text-center font-mono opacity-50">
      <div className="flex items-center justify-center gap-2 mb-6 text-[#ff007f]">
        <Zap fill="currentColor" size={20} />
        <h3 className="text-xl font-black uppercase tracking-wider">DAILY LOOT WHEEL</h3>
      </div>
      
      <p className="text-xs text-zinc-400 mb-8 uppercase">
        ⚡ Wheel of fortune rewards are currently disabled.
      </p>

      {/* Roulette Canvas Frame */}
      <div className="relative inline-block mb-8">
        {/* Pointer arrow at 12 o'clock */}
        <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-white filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" />
        
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="border-[6px] border-white bg-zinc-950 rounded-full shadow-none transition-transform duration-300"
        />
      </div>

      <div className="mt-4 space-y-6">
        <button
          disabled={true}
          className="w-full py-4 border-[3px] border-black font-black uppercase text-lg tracking-wider bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed shadow-none"
        >
          <RefreshCw size={18} />
          SPIN DISABLED
        </button>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-zinc-900 border-2 border-zinc-800 text-sm font-bold text-white uppercase tracking-tight"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default LuckySpinWheel;
