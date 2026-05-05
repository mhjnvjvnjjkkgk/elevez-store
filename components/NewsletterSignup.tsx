import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, AlertCircle, Copy } from 'lucide-react';
import { generateDiscountCode } from '../services/discountService';

interface NewsletterSignupProps {
  variant?: 'inline' | 'footer' | 'modal';
  title?: string;
  subtitle?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = 'inline',
  title = 'Stay Updated',
  subtitle = 'Get 10% off your first order + exclusive deals'
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');

    try {
      // Simulate API call - replace with actual email service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate unique discount code for newsletter subscriber
      const code = generateDiscountCode(10, 'newsletter', 1);
      setDiscountCode(code);
      
      setStatus('success');
      setMessage(`Welcome! Your exclusive code: ${code}`);
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        setDiscountCode('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handleCopyCode = () => {
    if (discountCode) {
      navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === 'footer') {
    return (
      <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000]">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="text-black" size={20} />
          <h3 className="text-lg font-black uppercase text-black">Newsletter</h3>
        </div>
        <p className="text-xs font-bold text-black uppercase mb-4 tracking-wider">{subtitle}</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-white border-[3px] border-black px-4 py-2 text-black placeholder-gray-500 font-bold focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all text-sm uppercase"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-black text-[#00ff88] px-4 py-2 border-[3px] border-black font-black text-sm uppercase tracking-widest hover:bg-[#00ff88] hover:text-black transition-all disabled:opacity-50"
          >
            {status === 'loading' ? '...' : 'Join'}
          </button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-3 text-xs font-black uppercase flex items-center gap-2 justify-center ${
                status === 'success' ? 'text-[#00ff88] bg-black p-2' : 'text-red-500 border-[2px] border-black p-2'
              }`}
            >
              {status === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              {status === 'success' && discountCode ? (
                <div className="flex items-center gap-2">
                  <span>Code: <code>{discountCode}</code></span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              ) : (
                message
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="bg-white border-[6px] border-black p-12 shadow-[16px_16px_0px_0px_#000] max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#00ff88] border-[4px] border-black flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_#000]">
            <Mail className="text-black" size={40} />
          </div>
          <h2 className="text-4xl font-black font-syne text-black mb-3 uppercase leading-tight">{title}</h2>
          <p className="text-black font-bold uppercase tracking-wider">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ENTER YOUR EMAIL"
            className="w-full bg-white border-[4px] border-black px-6 py-4 text-black placeholder-gray-400 font-black focus:shadow-[6px_6px_0px_0px_#00ff88] outline-none transition-all uppercase"
            disabled={status === 'loading'}
          />
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-black text-[#00ff88] px-6 py-4 border-[4px] border-black font-black uppercase tracking-[0.2em] hover:bg-[#00ff88] hover:text-black transition-all disabled:opacity-50 shadow-[8px_8px_0px_0px_#000]"
          >
            {status === 'loading' ? 'Subscribing...' : 'Get 10% Off'}
          </button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-6 p-4 border-[3px] border-black font-black uppercase text-center text-sm flex flex-col gap-3 ${
                status === 'success' 
                  ? 'bg-[#00ff88] text-black' 
                  : 'bg-red-500 text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {status === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{status === 'success' ? 'Welcome to the club!' : message}</span>
              </div>
              {status === 'success' && discountCode && (
                <div className="bg-white border-[2px] border-black p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] opacity-75 mb-1">Your 10% discount code:</p>
                    <code className="text-xl font-black tracking-widest">{discountCode}</code>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-black/10 rounded transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-black font-bold uppercase text-center mt-6 tracking-widest">
          No Spam. Only Fire. Unsubscribe anytime.
        </p>
      </div>
    );
  }

  // Default inline variant
  return (
    <section className="bg-[#00ff88] border-y-[6px] border-black py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white border-[6px] border-black p-12 md:p-20 shadow-[20px_20px_0px_0px_#000]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-6xl md:text-8xl font-black font-syne text-black mb-6 uppercase leading-[0.9]">{title}</h2>
              <p className="text-2xl text-black font-black uppercase mb-8 tracking-tight">{subtitle}</p>
              <ul className="space-y-4 text-black font-bold uppercase tracking-widest">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-black text-[#00ff88] flex items-center justify-center">✓</div>
                  10% off your first order
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-black text-[#00ff88] flex items-center justify-center">✓</div>
                  Exclusive deals & early access
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-black text-[#00ff88] flex items-center justify-center">✓</div>
                  New collection announcements
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                className="w-full bg-white border-[4px] border-black px-8 py-6 text-black placeholder-gray-400 font-black focus:shadow-[8px_8px_0px_0px_#00ff88] outline-none transition-all text-2xl uppercase"
                disabled={status === 'loading'}
              />
              
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-black text-[#00ff88] px-8 py-6 border-[4px] border-black font-black uppercase tracking-[0.2em] hover:bg-[#00ff88] hover:text-black transition-all disabled:opacity-50 text-2xl shadow-[10px_10px_0px_0px_#000]"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </button>

              <p className="text-xs text-black font-black uppercase text-center tracking-widest">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`mt-12 p-8 border-[4px] border-black font-black uppercase flex flex-col gap-4 ${
                  status === 'success' 
                    ? 'bg-[#00ff88] text-black shadow-[8px_8px_0px_0px_#000]' 
                    : 'bg-red-500 text-white shadow-[8px_8px_0px_0px_#000]'
                }`}
              >
                <div className="flex items-center gap-4 text-2xl">
                  {status === 'success' ? <Check size={32} /> : <AlertCircle size={32} />}
                  <span>{status === 'success' ? 'You are on the list!' : message}</span>
                </div>
                {status === 'success' && discountCode && (
                  <div className="bg-white border-[3px] border-black p-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs opacity-75 mb-2">Your exclusive discount code:</p>
                      <code className="text-4xl font-black tracking-[0.2em]">{discountCode}</code>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-4 bg-black text-white hover:bg-[#00ff88] hover:text-black transition-all flex-shrink-0"
                    >
                      {copied ? <Check size={32} /> : <Copy size={32} />}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
