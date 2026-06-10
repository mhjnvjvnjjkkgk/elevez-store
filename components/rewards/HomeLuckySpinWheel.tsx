import React, { useState, useEffect, useRef } from 'react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { audioService } from '../../services/audioService';
import { userPointsService } from '../../services/userPointsService';
import { Zap, Gift, RefreshCw, Phone, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Slice {
  label: string;
  type: 'discount' | 'empty';
  value: string;
  color: string;
  chance: number; // Probability weight
}

const SLICES: Slice[] = [
  { label: '99% OFF', type: 'discount', value: 'IMPOSSIBLE99', color: '#ff0055', chance: 0 },
  { label: '10% OFF', type: 'discount', value: 'SPIN10', color: '#ff007f', chance: 35 },
  { label: 'FREE SHIP', type: 'discount', value: 'FREESHIP', color: '#00ff88', chance: 25 },
  { label: '15% OFF', type: 'discount', value: 'SPIN15', color: '#00ffff', chance: 20 },
  { label: '90% OFF', type: 'discount', value: 'IMPOSSIBLE90', color: '#ff00ff', chance: 0 },
  { label: '₹20 OFF', type: 'discount', value: 'MINUS20', color: '#a200ff', chance: 15 },
  { label: '₹50 OFF!', type: 'discount', value: 'JACKPOT50', color: '#ff7e40', chance: 5 },
  { label: 'TRY AGAIN', type: 'empty', value: '', color: '#333333', chance: 0 }
];

export const HomeLuckySpinWheel: React.FC = () => {
  const { profile, refresh } = useLoyalty();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<Slice | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [leadDocId, setLeadDocId] = useState<string | null>(null);
  
  // 8 slices total. PI/4 per slice. Start pointer exactly in the middle of slice 0 (99% OFF)
  const START_ANGLE = 1.5 * Math.PI - Math.PI / 8;
  const currentAngleRef = useRef(START_ANGLE);
  const spinTimeRef = useRef(0);
  const spinTimeTotalRef = useRef(0);
  const spinAngleStartRef = useRef(START_ANGLE);
  const initialAngleRef = useRef(START_ANGLE);
  const lastSegmentRef = useRef(-1);
  const leadDocIdRef = useRef<string | null>(null);

  // Check if this guest/user has already captured phone number
  useEffect(() => {
    try {
      const storedPhone = localStorage.getItem(`elevez_captured_phone_home`);
      if (storedPhone || profile?.phoneNumber) {
        setIsUnlocked(true);
      }
    } catch (e) {
      console.warn('Error reading local phone storage:', e);
    }
  }, [profile]);

  // Initial draw
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, []);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution retina display scaling
    const scale = window.devicePixelRatio || 1;
    const size = 300;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = size * scale;
    canvas.height = size * scale;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    // Normalize coordinate system to use css pixels
    ctx.scale(scale, scale);

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

      // Glow effect to highlight the 99% OFF slice
      if (i === 0) {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.lineTo(center, center);
      ctx.fill();

      // Reset shadow for text and borders
      ctx.shadowBlur = 0;

      // Outer border for slice
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Extra visual highlight for 99% OFF slice (i === 0)
      if (i === 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#00ff88'; // Vibrant neon green highlight outline
        ctx.stroke();
        ctx.restore();
      }

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      
      // Select high-contrast text color
      ctx.fillStyle = slice.color === '#00ff88' || slice.color === '#00ffff' || slice.color === '#ff7e40' ? '#000000' : '#FFFFFF';
      
      // Highlight the text of the 99% OFF slice
      if (i === 0) {
        ctx.fillStyle = '#00ff88'; // neon green text
        ctx.font = '900 13px "Space Mono", Courier, monospace';
      } else {
        ctx.font = '900 12px "Space Mono", Courier, monospace';
      }
      
      ctx.fillText(slice.label, radius - 15, 4);
      ctx.restore();
    });

    // Center peg/cap
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Center icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', center, center);
  };

  const easeOut = (t: number, b: number, c: number, d: number): number => {
    // easeOutQuart for a much more fluid, realistic deceleration
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
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
      currentAngleRef.current = spinAngleStartRef.current; // snap exactly to target
      drawWheel(currentAngleRef.current);
      stopRotateWheel();
      return;
    }

    // Ease out from initial angle to target final angle
    currentAngleRef.current = easeOut(
      spinTimeRef.current, 
      initialAngleRef.current, 
      spinAngleStartRef.current - initialAngleRef.current, 
      spinTimeTotalRef.current
    );
    
    drawWheel(currentAngleRef.current);
    tickSoundTrigger(currentAngleRef.current);
    
    requestAnimationFrame(animateWheel);
  };

  const stopRotateWheel = async () => {
    setSpinning(false);
    const sliceAngle = (2 * Math.PI) / SLICES.length;
    
    const currentAngleNormalized = currentAngleRef.current % (2 * Math.PI);
    const pointerAngle = 1.5 * Math.PI; // 12 o'clock pointer
    let relativeAngle = pointerAngle - currentAngleNormalized;
    if (relativeAngle < 0) relativeAngle += 2 * Math.PI;
    
    const winningIndex = Math.floor(relativeAngle / sliceAngle) % SLICES.length;
    const won = SLICES[winningIndex];

    setSpinResult(won);
    
    // Update Firestore if we have a document reference
    if (leadDocIdRef.current) {
      try {
        const leadDocRef = doc(db, 'spinLeads', leadDocIdRef.current);
        await updateDoc(leadDocRef, {
          status: 'completed',
          prize: won.label,
          prizeCode: won.value || '',
          spunAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Error updating spin lead with result:', err);
      }
    }

    if (won.type === 'discount') {
      audioService.playSuccess();
      setMessage(`🎉 CONGRATS! You won a ${won.label} Code: ${won.value}`);
      try {
        navigator.clipboard.writeText(won.value);
      } catch (e) {
        console.warn('Clipboard write block:', e);
      }
    } else {
      audioService.playClick();
      setMessage('😅 TRY AGAIN TOMORROW! Better luck next time.');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      // Check limit for this phone number
      const lastSpinForPhone = localStorage.getItem(`elevez_home_spin_limit_${cleanPhone}`);
      if (lastSpinForPhone) {
        const hoursPassed = (Date.now() - parseInt(lastSpinForPhone)) / (1000 * 60 * 60);
        if (hoursPassed < 24) {
          setPhoneError(`Limit reached! Please come back in ${Math.ceil(24 - hoursPassed)} hours.`);
          return;
        }
      }

      // Save number locally (but don't record the spin limit until they actually click spin)
      localStorage.setItem('elevez_captured_phone_home', cleanPhone);

      // Save to Firestore spinLeads
      try {
        const leadsRef = collection(db, 'spinLeads');
        const docRef = await addDoc(leadsRef, {
          phoneNumber: cleanPhone,
          userId: profile?.userId || 'guest',
          userEmail: profile?.email || 'guest@elevez.com',
          userName: profile?.displayName || 'Guest User',
          status: 'pending_spin',
          prize: '',
          prizeCode: '',
          timestamp: serverTimestamp()
        });
        setLeadDocId(docRef.id);
        leadDocIdRef.current = docRef.id;
      } catch (firestoreErr) {
        console.error('Error saving spin lead to Firestore:', firestoreErr);
      }
      
      // Update profile if authenticated
      if (profile?.userId) {
        await userPointsService.updateUserProfile(profile.userId, { phoneNumber: cleanPhone });
        refresh();
      }

      audioService.playSuccess();
      setIsUnlocked(true);
      setPhoneError(null);
      setMessage('⚡ Spin unlocked! Good luck.');
    } catch (err) {
      console.error('Error verifying number:', err);
      setIsUnlocked(true);
    }
  };

  const handleSpinClick = async () => {
    if (spinning) return;

    // Enforce 24h limit on actual spin click
    const cleanPhone = localStorage.getItem('elevez_captured_phone_home') || profile?.phoneNumber?.replace(/\D/g, '');
    if (cleanPhone) {
      const lastSpinForPhone = localStorage.getItem(`elevez_home_spin_limit_${cleanPhone}`);
      if (lastSpinForPhone) {
        const hoursPassed = (Date.now() - parseInt(lastSpinForPhone)) / (1000 * 60 * 60);
        if (hoursPassed < 24) {
          setMessage(`⏳ You've already spun today! Come back in ${Math.ceil(24 - hoursPassed)} hours.`);
          return;
        }
      }
      // Record spin lock for exactly this phone
      localStorage.setItem(`elevez_home_spin_limit_${cleanPhone}`, Date.now().toString());
    }

    const storedPhone = cleanPhone || 'guest';

    // Capture lead if we don't have leadDocId (e.g. if they refreshed the page or already had phone number verified)
    if (!leadDocIdRef.current && storedPhone !== 'guest') {
      try {
        const leadsRef = collection(db, 'spinLeads');
        const docRef = await addDoc(leadsRef, {
          phoneNumber: storedPhone,
          userId: profile?.userId || 'guest',
          userEmail: profile?.email || 'guest@elevez.com',
          userName: profile?.displayName || 'Guest User',
          status: 'spinning',
          prize: '',
          prizeCode: '',
          timestamp: serverTimestamp()
        });
        setLeadDocId(docRef.id);
        leadDocIdRef.current = docRef.id;
      } catch (err) {
        console.error('Error creating spin lead on spin click:', err);
      }
    } else if (leadDocIdRef.current) {
      // If we already have a lead doc from validation, update its status to spinning
      try {
        const leadDocRef = doc(db, 'spinLeads', leadDocIdRef.current);
        await updateDoc(leadDocRef, {
          status: 'spinning'
        });
      } catch (err) {
        console.error('Error updating spin lead status to spinning:', err);
      }
    }

    setSpinResult(null);
    setMessage(null);
    setSpinning(true);
    setCopied(false);
    audioService.playWheelStart();

    // Pick rigged winner based on chance
    const rand = Math.random() * 100;
    let sum = 0;
    let winningIndex = SLICES.length - 1;
    for (let i = 0; i < SLICES.length; i++) {
      sum += SLICES[i].chance;
      if (rand <= sum) {
        winningIndex = i;
        break;
      }
    }

    // Calculate target angle
    const sliceAngle = (2 * Math.PI) / SLICES.length;
    
    // Near-miss physics: Tease the user by making it look like they almost hit 99% OFF
    let offset = 0.5; // Default center of slice
    if (winningIndex === 1) { // 10% OFF (adjacent ahead)
      offset = 0.05 + Math.random() * 0.1; // Barely crossed the line from 99%
    } else if (winningIndex === 7) { // TRY AGAIN (adjacent behind)
      offset = 0.85 + Math.random() * 0.1; // Almost reached the line to 99%
    } else {
      offset = 0.2 + Math.random() * 0.6; // Randomly inside other slices
    }

    // The pointer is at 1.5 * Math.PI (top / 12 o'clock)
    const targetNormalized = (1.5 * Math.PI - (winningIndex + offset) * sliceAngle + 2 * Math.PI) % (2 * Math.PI);
    
    const spins = 10 + Math.floor(Math.random() * 5); // 10 to 14 full spins
    const currentAngle = currentAngleRef.current;
    const currentNormalized = currentAngle % (2 * Math.PI);
    
    // Total angle to rotate
    let angleDiff = targetNormalized - currentNormalized;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;
    
    const targetFinalAngle = currentAngle + spins * 2 * Math.PI + angleDiff;

    initialAngleRef.current = currentAngle;
    spinAngleStartRef.current = targetFinalAngle; // We repurposed this to mean final target angle
    spinTimeRef.current = 0;
    spinTimeTotalRef.current = Math.random() * 2000 + 7000; // 7 to 9 seconds spin time
    
    animateWheel();
  };

  const copyToClipboard = () => {
    if (spinResult?.value) {
      navigator.clipboard.writeText(spinResult.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative border-y-4 sm:border-y-[8px] border-black bg-black py-10 sm:py-20 px-4 sm:px-6 overflow-hidden">
      {/* Dynamic Cyberpunk Grids */}
      <div className="absolute inset-0 opacity-15">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 0, 127, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 0, 127, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 sm:gap-16 relative z-10">
        
        {/* Left Column (Bottom on Mobile): Visual details */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-block bg-[#ff007f] text-black text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 sm:px-6 sm:py-2 border-[3px] border-black shadow-[4px_4px_0_0_#fff]">
            Interactive Drop
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white font-syne tracking-tighter leading-none">
            THE LUCKY <span className="text-[#ff007f]" style={{ WebkitTextStroke: '2px white' }}>SPIN WHEEL</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wide leading-relaxed max-w-lg">
            Unlock secret discounts of up to 99% off your next purchase. 
            <span className="text-[#00ff88] mx-1">Limit 1 spin per 24 hours per user.</span> 
            Enter your number to verify security credentials and activate the wheel!
          </p>

          <AnimatePresence mode="wait">
            {!isUnlocked ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-zinc-950 border-[3px] border-black p-6 shadow-[8px_8px_0_0_#ff007f] text-left"
              >
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <label className="block text-xs uppercase font-black tracking-widest text-[#ff007f]">
                    Verify Mobile Number to Spin:
                  </label>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto lg:mx-0">
                    <div className="flex items-center bg-zinc-900 border-[3px] border-black h-12 w-full focus-within:border-[#ff007f] transition-colors shadow-none">
                      <span className="text-zinc-400 font-mono font-black pl-4 pr-1 select-none">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-transparent border-none px-2 py-3 text-white font-mono placeholder-zinc-700 focus:outline-none h-full w-full"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#ff007f] text-white border-[3px] border-black px-8 py-3 font-black uppercase text-xs tracking-wider shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all h-12 flex items-center justify-center cursor-pointer"
                    >
                      UNLOCK SPIN
                    </button>
                  </div>
                  {phoneError && (
                    <p className="text-red-400 text-xs font-black uppercase tracking-wider mt-2">
                      ⚠️ {phoneError}
                    </p>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                <button
                  onClick={handleSpinClick}
                  disabled={spinning}
                  className={`w-full max-w-sm py-4 border-[3px] border-black font-black uppercase text-lg tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]
                    ${spinning 
                      ? 'bg-zinc-800 text-zinc-500 border-zinc-800 cursor-not-allowed shadow-none' 
                      : 'bg-[#ff007f] text-white shadow-[6px_6px_0_0_#fff] hover:bg-[#ff007f]/90'
                    }`}
                >
                  <RefreshCw className={spinning ? 'animate-spin' : ''} size={20} />
                  {spinning ? 'SPINNING...' : 'TAP TO SPIN'}
                </button>

                {message && (
                  <div className="p-4 bg-zinc-900/80 border-2 border-[#ff007f]/50 text-sm font-bold text-white uppercase tracking-tight flex items-center justify-between gap-4 max-w-md">
                    <span>{message}</span>
                    {spinResult && spinResult.type === 'discount' && (
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-1 bg-white text-black text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0 border border-black hover:bg-[#00ff88] transition-colors"
                      >
                        {copied ? 'COPIED' : <><Copy size={12} /> COPY</>}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Spining Wheel Canvas */}
        <div className="flex-shrink-0 flex items-center justify-center transform scale-90 sm:scale-100 origin-center -my-4 sm:my-0">
          <div className="relative p-4 sm:p-8 bg-zinc-900 border-[4px] sm:border-[6px] border-black shadow-[10px_10px_0_0_#ff007f] sm:shadow-[16px_16px_0_0_#ff007f] rounded-3xl">
            {/* Pointer arrow pointing down at 12 o'clock */}
            <div className="absolute top-[10px] sm:top-[20px] left-1/2 transform -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] sm:border-l-[14px] border-l-transparent border-r-[10px] sm:border-r-[14px] border-r-transparent border-t-[18px] sm:border-t-[24px] border-t-white filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" />
            
            <canvas
              ref={canvasRef}
              className="border-[4px] sm:border-[6px] border-black bg-zinc-950 rounded-full shadow-[0_0_30px_rgba(255,0,127,0.25)]"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
