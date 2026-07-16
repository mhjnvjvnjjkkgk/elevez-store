// AdminSetup.tsx
// First-run setup: registers the current user as super_admin if no admins exist yet.
// This page is shown at /admin when the user is logged in but not yet an admin.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { adminAuthService } from '../services/adminAuthService';

export const AdminSetup: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSetupAdmin = async () => {
    const user = auth.currentUser;
    if (!user) {
      setStatus('error');
      setMessage('You must be signed in with Google first.');
      return;
    }

    setStatus('loading');

    try {
      // Check if ANY admins already exist — prevent unauthorised self-promotion
      const existingAdmins = await adminAuthService.getAllAdmins();

      if (existingAdmins.length > 0) {
        setStatus('error');
        setMessage('Admin accounts already exist. Ask an existing super_admin to grant you access.');
        return;
      }

      // No admins yet — register this user as the first super_admin
      const result = await adminAuthService.createAdmin(
        user.uid,
        user.email || '',
        user.displayName || 'Admin',
        'super_admin'
      );

      if (result.success) {
        setStatus('success');
        setMessage('Super admin account created! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to create admin account.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Unexpected error occurred.');
    }
  };

  const user = auth.currentUser;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border-2 border-[#00ff88] p-10 max-w-md w-full text-center space-y-6 shadow-[8px_8px_0px_0px_#00ff88]"
      >
        <div className="flex justify-center">
          <Shield size={56} className="text-[#00ff88]" />
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-widest">Admin Setup</h1>
          <p className="text-gray-400 text-sm mt-2">
            No admin accounts exist yet. Click below to register yourself as the first super admin.
          </p>
        </div>

        {user && (
          <div className="bg-black border border-zinc-700 p-3 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
            <p className="text-[#00ff88] font-bold text-sm">{user.email}</p>
            <p className="text-gray-400 text-xs">{user.displayName}</p>
          </div>
        )}

        {status === 'idle' && (
          <button
            onClick={handleSetupAdmin}
            className="w-full bg-[#00ff88] text-black font-black uppercase py-3 border-2 border-black shadow-[4px_4px_0px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all tracking-widest"
          >
            Register as Super Admin
          </button>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-3 text-[#00ff88]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader size={24} />
            </motion.div>
            <span className="font-bold uppercase tracking-wider text-sm">Setting up...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center justify-center gap-3 text-[#00ff88]">
            <CheckCircle size={24} />
            <span className="font-bold text-sm">{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-red-400 bg-red-950/30 border border-red-800 p-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <span className="text-xs font-bold text-left">{message}</span>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="text-xs text-gray-500 hover:text-white underline"
            >
              Try again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
