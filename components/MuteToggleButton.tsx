import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioService } from '../services/audioService';

export const MuteToggleButton: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);

  // Sync mute state on mount
  useEffect(() => {
    setIsMuted(audioService.getMuteStatus());
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    audioService.setMute(nextMuted);
    setIsMuted(nextMuted);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className="fixed bottom-[var(--mute-btn-bottom,24px)] right-[var(--mute-btn-right,24px)] z-[9960] flex items-center justify-center p-3.5 bg-black border-[3px] border-black text-white hover:text-[#00ff88] transition-colors shadow-[3px_3px_0_0_#00ff88] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#00ff88] cursor-pointer"
        title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-pulse" />}
      </button>

      <style>{`
        :root {
          --mute-btn-bottom: 76px;
          --mute-btn-right: 16px;
        }
        @media (min-width: 768px) {
          :root {
            --mute-btn-bottom: 24px;
            --mute-btn-right: 24px;
          }
        }
      `}</style>
    </>
  );
};
export default MuteToggleButton;
