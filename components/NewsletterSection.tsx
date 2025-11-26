import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('Welcome to our newsletter!');
      setEmail('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-[#00ff88]/10 via-purple-500/10 to-[#00ff88]/10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="w-16 h-16 bg-gradient-to-br from-[#00ff88] to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00ff88]/50"
        >
          <Mail className="w-8 h-8 text-black" />
        </motion.div>

        <h2 className="text-4xl md:text-5xl font-black font-syne text-white mb-4">
          Stay Updated
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Get exclusive deals, new releases, and insider tips delivered to your inbox
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 bg-black/50 border border-white/20 rounded-full text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
            disabled={status === 'loading'}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-4 bg-[#00ff88] text-black font-bold rounded-full uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {status === 'loading' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                />
                Subscribing...
              </>
            ) : status === 'success' ? (
              <>
                <Check size={20} />
                Subscribed!
              </>
            ) : (
              'Subscribe'
            )}
          </motion.button>
        </form>

        {/* Status Messages */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#00ff88]/20 border border-[#00ff88]/50 rounded-lg text-[#00ff88] flex items-center gap-2"
          >
            <Check size={20} />
            {message}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {message}
          </motion.div>
        )}

        <p className="text-gray-500 text-sm mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </motion.div>
    </section>
  );
};
