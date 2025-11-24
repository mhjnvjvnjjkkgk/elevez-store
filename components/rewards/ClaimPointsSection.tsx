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
      points: pointsRules.INSTAGRAM_SHARE,
      color: 'from-purple-500 to-pink-500',
      claimed: profile?.socialShares.instagram,
      action: () => handleSocialClaim('instagram')
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      name: 'WhatsApp',
      points: pointsRules.WHATSAPP_SHARE,
      color: 'from-green-500 to-emerald-500',
      claimed: profile?.socialShares.whatsapp,
      action: () => handleSocialClaim('whatsapp')
    },
    {
      id: 'facebook',
      icon: Facebook,
      name: 'Facebook',
      points: pointsRules.FACEBOOK_SHARE,
      color: 'from-blue-500 to-cyan-500',
      claimed: profile?.socialShares.facebook,
      action: () => handleSocialClaim('facebook')
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Earn Bonus Points</h2>
          <p className="text-xl text-white/70">Complete these simple actions to boost your points</p>
        </motion.div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`mb-6 p-4 rounded-xl backdrop-blur-xl border ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/50 text-green-100' 
                : 'bg-red-500/20 border-red-500/50 text-red-100'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Social Sharing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {socialActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 
                            hover:bg-white/15 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} 
                              flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-2">{action.name}</h3>
                <p className="text-center text-white/70 mb-4">+{action.points} points</p>

                <button
                  onClick={action.action}
                  disabled={action.claimed || loading === action.id}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 
                            flex items-center justify-center gap-2 ${
                              action.claimed
                                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                : `bg-gradient-to-r ${action.color} text-white hover:shadow-lg hover:scale-105`
                            }`}
                >
                  {loading === action.id ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : action.claimed ? (
                    <>
                      <Check className="w-5 h-5" />
                      Claimed
                    </>
                  ) : (
                    'Share & Claim'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Phone Number Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 
                          flex items-center justify-center shadow-lg">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Add Phone Number</h3>
              <p className="text-white/70">Earn +{pointsRules.PHONE_NUMBER} points</p>
            </div>
          </div>

          {profile?.phoneNumber ? (
            <div className="flex items-center gap-2 text-white/70">
              <Check className="w-5 h-5 text-green-400" />
              <span>Phone number added: {profile.phoneNumber}</span>
            </div>
          ) : (
            <div className="flex gap-4">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                         text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
              <button
                onClick={handlePhoneClaim}
                disabled={loading === 'phone'}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl 
                         text-white font-semibold hover:shadow-lg hover:scale-105 
                         transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {loading === 'phone' ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Claim Points'
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
