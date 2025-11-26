import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { virtualTryOnService, TryOnSession } from '../services/virtualTryOnService';

interface VirtualTryOnProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ isOpen, onClose, product }) => {
  const [session, setSession] = useState<TryOnSession | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    // Initialize session if needed
    let currentSession = session;
    if (!currentSession) {
      currentSession = virtualTryOnService.initSession(product);
      setSession(currentSession);
    }

    // Upload photo
    const result = await virtualTryOnService.uploadUserPhoto(currentSession.id, file);

    if (result.success && result.resultImage) {
      setUserImage(result.resultImage);
      setStep('preview');
    } else {
      setError(result.error || 'Failed to upload image');
    }

    setIsProcessing(false);
  };

  const handleCameraCapture = async () => {
    setError(null);
    setIsProcessing(true);

    // Request camera permission
    const hasPermission = await virtualTryOnService.requestCameraPermission();
    
    if (!hasPermission) {
      setError('Camera permission denied');
      setIsProcessing(false);
      return;
    }

    // Capture photo
    const photo = await virtualTryOnService.capturePhoto();
    
    if (photo) {
      setUserImage(photo);
      setStep('preview');
    } else {
      setError('Failed to capture photo');
    }

    setIsProcessing(false);
  };

  const handleProcessTryOn = async () => {
    if (!session) return;

    setError(null);
    setIsProcessing(true);

    const result = await virtualTryOnService.processTryOn(session.id, product);

    if (result.success && result.resultImage) {
      setResultImage(result.resultImage);
      setStep('result');
    } else {
      setError(result.error || 'Failed to process try-on');
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    setUserImage(null);
    setResultImage(null);
    setStep('upload');
    setError(null);
    if (session) {
      virtualTryOnService.clearSession(session.id);
      setSession(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-black border border-white/10 rounded-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00ff88]/20 to-transparent p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Virtual Try-On</h2>
                  <p className="text-gray-400">{product.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {/* Step: Upload */}
              {step === 'upload' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold mb-2">Upload Your Photo</h3>
                    <p className="text-gray-400">
                      Take a photo or upload one to see how this product looks on you
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Camera Capture */}
                    <button
                      onClick={handleCameraCapture}
                      disabled={isProcessing}
                      className="p-8 border-2 border-dashed border-white/20 rounded-xl hover:border-[#00ff88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera size={48} className="mx-auto mb-4 text-[#00ff88]" />
                      <p className="font-bold mb-2">Take a Photo</p>
                      <p className="text-sm text-gray-400">Use your camera</p>
                    </button>

                    {/* File Upload */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="p-8 border-2 border-dashed border-white/20 rounded-xl hover:border-[#00ff88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={48} className="mx-auto mb-4 text-[#00ff88]" />
                      <p className="font-bold mb-2">Upload Photo</p>
                      <p className="text-sm text-gray-400">Choose from gallery</p>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {isProcessing && (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <Loader size={24} className="animate-spin text-[#00ff88]" />
                      <span>Processing...</span>
                    </div>
                  )}

                  <div className="mt-8 p-4 bg-white/5 rounded-lg">
                    <h4 className="font-bold mb-2">Tips for Best Results:</h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li>• Use good lighting</li>
                      <li>• Face the camera directly</li>
                      <li>• Stand against a plain background</li>
                      <li>• Make sure your full upper body is visible</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step: Preview */}
              {step === 'preview' && userImage && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">Preview Your Photo</h3>
                    <p className="text-gray-400">
                      Ready to see how {product.name} looks on you?
                    </p>
                  </div>

                  <div className="relative aspect-[3/4] max-w-md mx-auto rounded-xl overflow-hidden">
                    <img
                      src={userImage}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Try Different Photo
                    </button>
                    <button
                      onClick={handleProcessTryOn}
                      disabled={isProcessing}
                      className="flex-1 bg-[#00ff88] text-black py-3 px-6 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Try It On'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Result */}
              {step === 'result' && resultImage && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle size={48} className="mx-auto mb-4 text-[#00ff88]" />
                    <h3 className="text-xl font-bold mb-2">Here's How It Looks!</h3>
                    <p className="text-gray-400">
                      {product.name} styled on you
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Original */}
                    <div>
                      <p className="text-sm font-bold mb-2 text-center">Original</p>
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                        <img
                          src={userImage || ''}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* With Product */}
                    <div>
                      <p className="text-sm font-bold mb-2 text-center">With {product.name}</p>
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#00ff88]">
                        <img
                          src={resultImage}
                          alt="Try-on result"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-[#00ff88] text-black py-3 px-6 rounded-lg font-bold hover:bg-white transition-colors"
                    >
                      Looks Great!
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
