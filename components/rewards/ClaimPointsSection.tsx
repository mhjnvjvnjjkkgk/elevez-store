import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLoyalty } from '../../hooks/useLoyalty';
import { Instagram, MessageCircle, Facebook, Phone, Check, Loader } from 'lucide-react';

export const ClaimPointsSection: React.FC = () => {
  const { profile, claimSocialPoints, claimPhonePoints, pointsRules } = useLoyalty();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSocialClaim = async (platform: 'instagram' | 'whatsapp' | 'facebook') => {
    setLoading(platform);
    setMessage(null);
    
    try {
      const claimed = await claimSocialPoints(platform);
      if (claimed) {
        setMessage({ type: 'success', text: `+${pointsRules[`${platform.toUpperCase()}_SHARE`]} points earned!` });
      } else {
        setMessage({ type: 'error', text: 'Already claimed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(null);
    }
  };

  const handlePhoneClaim = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }

    setLoading('phone');
    setMessage(null);
    
    try {
      const claimed = await claimPhonePoints(phoneNumber);
      if (claimed) {
        setMessage({ type: 'success', text: `+${pointsRules.PHONE_NUMBER} points earned!` });
        setPhoneNumber('');
      } else {
        setMessage({ type: 'error', text: 'Phone number already added' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(null);
    }
  };

  const socialActions = [
    {
      id: 'instagram',
      icon: Instagram,
      name: 'Instagram',
      points: pointsRules?.INSTAGRAM_SHARE || 50,
      color: 'from-purple-500 to-pink-500',
      claimed: profile?.socialShares?.instagram || false,
      action: () => handleSocialClaim('instagram')
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      name: 'WhatsApp',
      points: pointsRules?.WHATSAPP_SHARE || 50,
      color: 'from-green-500 to-emerald-500',
      claimed: profile?.socialShares?.whatsapp || false,
      action: () => handleSocialClaim('whatsapp')
    },
    {
      id: 'facebook',
      icon: Facebook,
      name: 'Facebook',
      points: pointsRules?.FACEBOOK_SHARE || 50,
      color: 'from-blue-500 to-cyan-500',
      claimed: profile?.socialShares?.facebook || false,
      action: () => handleSocialClaim('facebook')
    }
  ];

  return (
    <section className="py-24 px-6 bg-white border-b-[8px] border-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
            Objectives
          </div>
          <h2 className="text-6xl md:text-8xl font-black font-syne text-black uppercase leading-none tracking-tighter">
            EARN <span className="text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }}>BONUS</span>
          </h2>
        </div>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`mb-12 p-8 border-[6px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-xl ${
                message.type === 'success' ? 'bg-[#00ff88] text-black' : 'bg-red-500 text-white'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Sharing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {socialActions.map((action, index) => (
            <div
              key={action.id}
              className={`bg-white border-[6px] border-black p-10 transition-all relative group flex flex-col h-full ${
                action.claimed 
                  ? 'opacity-40 grayscale shadow-[8px_8px_0px_0px_#000]' 
                  : 'shadow-[12px_12px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] hover:-translate-y-2'
              }`}
            >
              <div className="w-20 h-20 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_0px_#00ff88] group-hover:scale-110 transition-transform mx-auto">
                <action.icon size={36} />
              </div>

              <h3 className="text-3xl font-black text-black text-center mb-2 uppercase font-syne">{action.name}</h3>
              <p className="text-center font-black text-black opacity-40 uppercase tracking-tighter mb-10 pb-10 border-b-[3px] border-black border-dashed flex-grow">
                +{action.points} PTS GAIN
              </p>

              <button
                onClick={action.action}
                disabled={action.claimed || loading === action.id}
                className={`w-full py-5 font-black uppercase text-xl border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-4 ${
                  action.claimed ? 'bg-white text-black opacity-30 cursor-not-allowed' : 'bg-[#00ff88] text-black'
                }`}
              >
                {loading === action.id ? (
                  <Loader size={24} className="animate-spin" />
                ) : action.claimed ? (
                  <><Check size={24} /> SECURED</>
                ) : (
                  'INITIALIZE'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Phone Number Card */}
        <div className="bg-white border-[8px] border-black p-12 shadow-[20px_20px_0px_0px_#000] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 -translate-y-16 translate-x-16 rotate-45" />
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="w-24 h-24 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#00ff88] shrink-0">
              <Phone size={48} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-4xl font-black uppercase text-black font-syne mb-2 leading-none">COMM LINK SYNC</h3>
              <p className="text-xl font-bold text-black opacity-50 uppercase">ESTABLISH CONNECTION FOR +{pointsRules.PHONE_NUMBER} PTS</p>
            </div>

            {profile?.phoneNumber ? (
              <div className="bg-[#00ff88] border-[4px] border-black px-10 py-6 flex items-center gap-6 shadow-[8px_8px_0px_0px_#000]">
                <Check size={32} className="text-black font-black" />
                <span className="text-2xl font-black text-black uppercase">SYNCED: {profile.phoneNumber}</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="TEL_NUMBER"
                  className="px-8 py-5 bg-white border-[4px] border-black font-black text-2xl uppercase focus:outline-none focus:shadow-[8px_8px_0px_0px_#00ff88] transition-all min-w-[300px]"
                />
                <button
                  onClick={handlePhoneClaim}
                  disabled={loading === 'phone'}
                  className="bg-[#00ff88] text-black px-12 py-5 border-[4px] border-black font-black uppercase text-2xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-4 whitespace-nowrap"
                >
                  {loading === 'phone' ? (
                    <Loader size={28} className="animate-spin" />
                  ) : (
                    'LINK'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
