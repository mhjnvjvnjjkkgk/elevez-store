import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Terminal, Check, AlertCircle } from 'lucide-react';
import { GlitchText } from './GlitchText';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, setDoc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const NewsletterSyndicate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('INVALID_EMAIL_PROTOCOL');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      console.log('Syncing syndicate registration to Firestore:', email);

      // 1. Query if user already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      let userId = '';
      if (!querySnapshot.empty) {
        // User exists, update subscription status
        const userDoc = querySnapshot.docs[0];
        userId = userDoc.id;
        await updateDoc(doc(db, 'users', userId), {
          subscribed: true,
          lastLogin: serverTimestamp(),
          source: 'newsletter'
        });
      } else {
        // User doesn't exist, create auto-generated user document
        const newUserRef = await addDoc(collection(db, 'users'), {
          email: email.trim().toLowerCase(),
          totalPoints: 100,
          tier: 'bronze',
          orderCount: 0,
          totalSpent: 0,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          source: 'newsletter',
          subscribed: true,
          firstName: email.split('@')[0],
          lastName: ''
        });
        userId = newUserRef.id;
      }

      // 2. Ensure loyaltyProfile exists with signup points
      const loyaltyRef = doc(db, 'loyaltyProfiles', userId);
      const loyaltyDoc = await getDoc(loyaltyRef);
      if (!loyaltyDoc.exists()) {
        await setDoc(loyaltyRef, {
          userId,
          email: email.trim().toLowerCase(),
          points: 100,
          totalPoints: 100,
          totalPointsEarned: 100,
          tier: 'Bronze',
          joinedAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          orderCount: 0,
          socialShares: {
            instagram: false,
            whatsapp: false,
            facebook: false
          }
        });

        // Log transaction
        await addDoc(collection(db, 'pointsTransactions'), {
          userId,
          type: 'earn',
          points: 100,
          reason: 'Sign-up bonus',
          timestamp: serverTimestamp()
        });
      }

      // 3. Ensure userPoints exists
      const pointsRef = doc(db, 'userPoints', userId);
      const pointsDoc = await getDoc(pointsRef);
      if (!pointsDoc.exists()) {
        await setDoc(pointsRef, {
          userId,
          email: email.trim().toLowerCase(),
          displayName: email.split('@')[0],
          totalPoints: 100,
          totalPointsEarned: 100,
          tier: 'bronze',
          orderCount: 0,
          updatedAt: new Date().toISOString()
        });
      }

      setStatus('success');
      setMessage('ACCESS_GRANTED // CHECK_POINTS_PORTAL');
      setEmail('');
    } catch (error: any) {
      console.error('Syndicate registration sync error:', error);
      setStatus('error');
      setMessage('CONNECTION_FAILED // RETRY');
    }
  };

  return (
    <section className="relative py-16 sm:py-28 bg-white border-y-4 sm:border-y-[10px] border-black overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none">
        <div className="text-[12rem] sm:text-[25rem] font-black font-syne leading-none uppercase absolute -top-10 -left-10 rotate-[-12deg]">
          SYNDICATE SYNDICATE SYNDICATE
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-14 h-14 sm:w-20 sm:h-20 bg-black text-[#00ff88] flex items-center justify-center border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] mb-6"
            >
              <Terminal size="100%" className="w-6 h-6 sm:w-10 sm:h-10" />
            </motion.div>
            
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-syne text-black leading-none uppercase tracking-tighter mb-4 sm:mb-6">
              JOIN THE <br />
              <span className="text-white" style={{ WebkitTextStroke: '2px black' }}>SYNDICATE</span>
            </h2>
            
            <p className="text-[10px] sm:text-sm md:text-base font-black text-black uppercase tracking-[0.15em] max-w-xl mb-0 italic">
              ACCESS EXCLUSIVE DROPS, DIGITAL PROTOCOLS, AND URBAN UTILITY SIGNALS.
            </p>
          </div>

          <div className="relative max-w-lg mx-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 border-[4px] sm:border-[6px] border-black shadow-[8px_8px_0px_0px_#00ff88] sm:shadow-[12px_12px_0px_0px_#00ff88] group transition-all hover:shadow-[8px_8px_0px_0px_#000] sm:hover:shadow-[12px_12px_0px_0px_#000]">
              <div className="flex-1 flex items-center bg-white p-3.5 sm:p-4.5 gap-3 border-b-[4px] sm:border-b-0 border-black">
                <Mail className="text-black shrink-0" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER_EMAIL_ADDRESS" 
                  className="w-full bg-transparent outline-none font-black uppercase text-sm sm:text-base placeholder:text-gray-300"
                  disabled={status === 'loading'}
                />
              </div>
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="bg-black text-[#00ff88] px-6 py-3.5 sm:px-8 sm:py-4.5 font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#00ff88] hover:text-black transition-all disabled:opacity-50 min-w-0 sm:min-w-[150px] cursor-pointer"
              >
                {status === 'loading' ? 'SYNCING...' : 'CONNECT'} <ArrowRight size={14} className="shrink-0" />
              </button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-4 p-3 border-[3px] border-black font-black uppercase text-center text-xs flex items-center justify-center gap-2.5 ${
                    status === 'success' 
                      ? 'bg-[#00ff88] text-black shadow-[4px_4px_0px_0px_#000]' 
                      : 'bg-red-500 text-white shadow-[4px_4px_0px_0px_#000]'
                  }`}
                >
                  {status === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-6 flex justify-between items-center text-[9px] sm:text-xs font-black uppercase tracking-widest text-black opacity-40">
              <span>PROTOCOL: V2.0.4</span>
              <span>ESTABLISHED IN THE VOID</span>
              <GlitchText text="ENCRYPTED" triggerOnHover={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Side Marquees */}
      <div className="absolute right-0 top-0 h-full w-20 flex flex-col justify-around pointer-events-none opacity-20 hidden lg:flex">
        <div className="rotate-90 whitespace-nowrap font-black text-6xl text-black uppercase tracking-tighter">ACCESS GRANTED ///</div>
        <div className="rotate-90 whitespace-nowrap font-black text-6xl text-black uppercase tracking-tighter">ACCESS GRANTED ///</div>
      </div>
    </section>
  );
};
