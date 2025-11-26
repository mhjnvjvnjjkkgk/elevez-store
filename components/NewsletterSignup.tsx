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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-[#00ff88]/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-[#00ff88]/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <Mail className="text-[#00ff88]" size={20} />
          <h3 className="text-lg font-bold text-white">Newsletter</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-black/50 border border-white/10 px-4 py-2 rounded-lg text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors text-sm"
            disabled={status === 'loading'}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={status === 'loading'}
            className="bg-[#00ff88] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? '...' : 'Join'}
          </motion.button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-3 text-xs flex items-center gap-2 justify-center ${
                status === 'success' ? 'text-[#00ff88]' : 'text-red-400'
              }`}
            >
              {status === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              {status === 'success' && discountCode ? (
                <div className="flex items-center gap-2">
                  <span>Code: <code className="font-bold">{discountCode}</code></span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
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
      </motion.div>
    );
  }

  if (variant === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-black/90 to-black/80 backdrop-blur-xl rounded-3xl p-12 border border-[#00ff88]/30 max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 bg-gradient-to-br from-[#00ff88] to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="text-black" size={32} />
          </motion.div>
          <h2 className="text-3xl font-black font-syne text-white mb-3">{title}</h2>
          <p className="text-gray-400">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-black/50 border border-white/10 px-6 py-3 rounded-xl text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
            disabled={status === 'loading'}
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#00ff88] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 shadow-[0_0_30px_rgba(0,255,136,0.3)]"
          >
            {status === 'loading' ? 'Subscribing...' : 'Get 10% Off'}
          </motion.button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-4 rounded-lg text-sm flex flex-col gap-3 ${
                status === 'success' 
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {status === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>Welcome to our newsletter!</span>
              </div>
              {status === 'success' && discountCode && (
                <div className="bg-black/30 rounded-lg p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Your 10% discount code:</p>
                    <code className="text-lg font-black tracking-widest">{discountCode}</code>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-gray-500 text-center mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </motion.div>
    );
  }

  // Default inline variant
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto px-6 py-20"
    >
      <div className="bg-gradient-to-r from-[#00ff88]/20 via-purple-500/20 to-[#00ff88]/20 backdrop-blur-xl rounded-3xl p-12 border border-[#00ff88]/30 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-purple-500/5 animate-pulse" />
        
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-white mb-4">{title}</h2>
              <p className="text-lg text-gray-300 mb-2">{subtitle}</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ 10% off your first order</li>
                <li>✓ Exclusive deals & early access</li>
                <li>✓ New collection announcements</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-black/50 border border-white/10 px-6 py-4 rounded-xl text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors text-lg"
                disabled={status === 'loading'}
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#00ff88] text-black px-6 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 shadow-[0_0_30px_rgba(0,255,136,0.3)]"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </motion.button>

              <p className="text-xs text-gray-500 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-6 p-4 rounded-lg flex flex-col gap-3 ${
                  status === 'success' 
                    ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {status === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                  <span>Welcome to our newsletter!</span>
                </div>
                {status === 'success' && discountCode && (
                  <div className="bg-black/30 rounded-lg p-4 flex items-center justify-between gap-3 ml-7">
                    <div>
                      <p className="text-xs opacity-75 mb-2">Your 10% discount code:</p>
                      <code className="text-2xl font-black tracking-widest">{discountCode}</code>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};
