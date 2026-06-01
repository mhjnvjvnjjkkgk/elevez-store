import React, { useRef, useEffect, useState } from 'react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { audioService } from '../../services/audioService';
import { Sparkles, Star, Gift, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCRATCH_REWARDS = [
  { text: '150 PTS', type: 'points', value: 150 },
  { text: '20% OFF', type: 'discount', value: 'HYPESCRATCH20' },
  { text: '50 PTS', type: 'points', value: 50 },
  { text: '15% OFF', type: 'discount', value: 'STREET15' }
];

export const ScratchCard: React.FC = () => {
  const { profile, awardCustomPoints, redeemPoints, refresh } = useLoyalty();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [reward, setReward] = useState<typeof SCRATCH_REWARDS[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize scratch card overlay
  const initCard = (rewardObj: typeof SCRATCH_REWARDS[0]) => {
    setReward(rewardObj);
    setScratchedPercent(0);
    setHasRevealed(false);
    setCardError(null);
    setIsCanvasReady(false);
    
    // Tiny delay to ensure DOM and dimensions are correct
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Draw scratch layer
      ctx.fillStyle = '#666666'; // solid slate grey
      ctx.fillRect(0, 0, width, height);

      // Add retro noise texture to look authentic
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 800; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 1;
        ctx.fillRect(x, y, size, size);
      }

      // Draw instructions on top of scratch coating
      ctx.fillStyle = '#00ff88';
      ctx.font = 'black 14px "Courier New", Courier, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ SCRATCH HERE ⚡', width / 2, height / 2 - 10);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px "Courier New", Courier, monospace';
      ctx.fillText('ERASE 50% COATING', width / 2, height / 2 + 15);
      
      setIsCanvasReady(true);
    }, 100);
  };

  const handlePurchase = async () => {
    if (profile && profile.points < 30) {
      setCardError('❌ Need 30 PTS to buy a ticket.');
      return;
    }

    try {
      if (profile) {
        await redeemPoints(30, 0);
        refresh();
      }
      
      // Select random reward
      const randomReward = SCRATCH_REWARDS[Math.floor(Math.random() * SCRATCH_REWARDS.length)];
      setIsPlaying(true);
      initCard(randomReward);
      audioService.playTick();
    } catch (e: any) {
      setCardError(`❌ Buy failed: ${e.message}`);
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Erase drawing mode
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 2 * Math.PI); // Radius of eraser
    ctx.fill();

    // Debounced percentage check (every 5 scratch operations)
    checkScratchedPercent();
  };

  const checkScratchedPercent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Sample 1 out of 32 pixels to optimize CPU performance
    const step = 32;
    const imgData = ctx.getImageData(0, 0, width, height);
    let transparent = 0;
    let total = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = imgData.data[index + 3];
        if (alpha === 0) {
          transparent++;
        }
        total++;
      }
    }

    const percent = transparent / total;
    setScratchedPercent(percent);

    if (percent > 0.48 && !hasRevealed) {
      revealCard();
    }
  };

  const revealCard = () => {
    setHasRevealed(true);
    audioService.playSuccess();

    // Reward points / code
    if (reward) {
      if (reward.type === 'points') {
        const pts = reward.value as number;
        if (profile) {
          awardCustomPoints(pts, `Scratch ticket win: ${reward.text}`)
            .then(() => refresh())
            .catch(err => console.error(err));
        }
      } else if (reward.type === 'discount') {
        try {
          navigator.clipboard.writeText(reward.value as string);
        } catch {}
      }
    }
  };

  // Drag listeners
  const handleMouseDown = () => setIsScratching(true);
  const handleMouseUp = () => setIsScratching(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching || hasRevealed) return;
    scratch(e.clientX, e.clientY);
  };

  // Touch listener for mobile devices
  const handleTouchStart = () => setIsScratching(true);
  const handleTouchEnd = () => setIsScratching(false);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScratching || hasRevealed || e.touches.length === 0) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  return (
    <div className="bg-black text-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#ff007f] max-w-md mx-auto text-center font-mono">
      <div className="flex items-center justify-center gap-2 mb-6 text-[#ff007f]">
        <Gift size={20} fill="currentColor" />
        <h3 className="text-xl font-black uppercase tracking-wider">HYPED SCRATCH ZONE</h3>
      </div>

      <p className="text-xs text-zinc-400 mb-8 uppercase">
        🎫 Buy a scratch ticket for 30 PTS. Scratch to win exclusive codes or points!
      </p>

      {!isPlaying ? (
        <div className="border-[4px] border-dashed border-zinc-700 bg-zinc-950 p-12 flex flex-col items-center justify-center min-h-[220px]">
          <ShoppingBag size={48} className="text-zinc-600 mb-6" />
          <button
            onClick={handlePurchase}
            disabled={profile && profile.points < 30}
            className={`px-8 py-3 border-[3px] border-black font-black uppercase tracking-wider cursor-pointer active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all
              ${profile && profile.points < 30
                ? 'bg-zinc-800 text-zinc-500 border-zinc-800 cursor-not-allowed shadow-none'
                : 'bg-[#ff007f] text-white shadow-[4px_4px_0_0_#000] hover:bg-[#ff007f]/90'
              }`}
          >
            GET TICKET (-30 PTS)
          </button>
          {cardError && <p className="text-red-500 text-xs mt-4 uppercase font-bold">{cardError}</p>}
        </div>
      ) : (
        <div className="relative inline-block w-[300px] h-[180px] select-none overflow-hidden border-[4px] border-white bg-zinc-900 shadow-[0_0_15px_rgba(255,0,127,0.3)]">
          {/* Card Content underneath scratch cover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-4 border-[2px] border-black">
            <Star fill="#00ff88" color="#00ff88" className="animate-spin mb-2" size={24} />
            <h4 className="text-xs uppercase text-zinc-400 font-bold mb-1">YOU UNLOCKED</h4>
            <div className="text-3xl font-black text-[#00ff88] tracking-widest font-syne">
              {reward?.text}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2 uppercase">
              {reward?.type === 'points' 
                ? '⚡ Added points to your account' 
                : '🎟️ Code copied to clipboard!'}
            </p>
          </div>

          {/* Eraser scratch canvas layer */}
          <AnimatePresence>
            {!hasRevealed && (
              <motion.canvas
                ref={canvasRef}
                width={300}
                height={180}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 cursor-crosshair touch-none"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {isPlaying && (
        <div className="mt-8 space-y-4">
          {hasRevealed ? (
            <button
              onClick={() => setIsPlaying(false)}
              className="w-full py-4 bg-[#00ff88] text-black border-[3px] border-black font-black uppercase tracking-wider shadow-[4px_4px_0_0_#000] cursor-pointer hover:bg-[#00ff88]/90"
            >
              PLAY AGAIN
            </button>
          ) : (
            <p className="text-xs text-[#ff007f] font-black uppercase tracking-wider animate-pulse">
              Scratch off: {(scratchedPercent * 100).toFixed(0)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default ScratchCard;
