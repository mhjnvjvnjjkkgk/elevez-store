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
    <section className="relative py-40 bg-white border-y-[10px] border-black overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="text-[30rem] font-black font-syne leading-none uppercase absolute -top-20 -left-20 rotate-[-15deg]">
          SYNDICATE SYNDICATE SYNDICATE
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-24 h-24 bg-black text-[#00ff88] flex items-center justify-center border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-8"
            >
              <Terminal size={48} />
            </motion.div>
            
            <h2 className="text-6xl md:text-9xl font-black font-syne text-black leading-none uppercase tracking-tighter mb-8">
              JOIN THE <br />
              <span className="text-white" style={{ WebkitTextStroke: '3px black' }}>SYNDICATE</span>
            </h2>
            
            <p className="text-xl md:text-2xl font-black text-black uppercase tracking-[0.2em] max-w-2xl mb-12 italic">
              ACCESS EXCLUSIVE DROPS, DIGITAL PROTOCOLS, AND URBAN UTILITY SIGNALS.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-0 border-[6px] border-black shadow-[16px_16px_0px_0px_#00ff88] group transition-all hover:shadow-[16px_16px_0px_0px_#000]">
              <div className="flex-1 flex items-center bg-white p-6 gap-4">
                <Mail className="text-black" size={24} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER_EMAIL_ADDRESS" 
                  className="w-full bg-transparent outline-none font-black uppercase text-xl placeholder:text-gray-300"
                  disabled={status === 'loading'}
                />
              </div>
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="bg-black text-[#00ff88] px-10 py-6 font-black uppercase text-xl flex items-center justify-center gap-4 hover:bg-[#00ff88] hover:text-black transition-all disabled:opacity-50 min-w-[200px]"
              >
                {status === 'loading' ? 'SYNCING...' : 'CONNECT'} <ArrowRight size={24} />
              </button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-6 p-4 border-[3px] border-black font-black uppercase text-center text-sm flex items-center justify-center gap-3 ${
                    status === 'success' 
                      ? 'bg-[#00ff88] text-black shadow-[4px_4px_0px_0px_#000]' 
                      : 'bg-red-500 text-white shadow-[4px_4px_0px_0px_#000]'
                  }`}
                >
                  {status === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-8 flex justify-between items-center text-xs font-black uppercase tracking-widest text-black opacity-40">
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
