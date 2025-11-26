import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Package, Truck, MapPin, Mail, Phone, Download, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Order } from '../services/checkoutService';

interface OrderConfirmationProps {
  order?: Order;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order }) => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [loading, setLoading] = useState(!order);

  // If no order provided, you would fetch it here
  useEffect(() => {
    if (!order && orderId) {
      // Fetch order from backend
      setLoading(false);
    }
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Order not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#00ff88] text-black font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <Check size={48} className="text-[#00ff88]" />
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-400 text-lg">Thank you for your purchase</p>
        </motion.div>

        {/* Order Number & Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-400 text-sm mb-2">Order Number</p>
              <p className="text-2xl font-bold text-[#00ff88]">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Order Date</p>
              <p className="text-2xl font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Amount</p>
              <p className="text-2xl font-bold text-[#00ff88]">₹{order.total.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-white/10 last:border-0">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-20 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.productName}</h3>
                  <p className="text-sm text-gray-400">
                    {item.size} • {item.color} • Qty: {item.quantity}
                  </p>
                  <p className="text-[#00ff88] font-bold mt-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        >
          {/* Shipping Address */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={24} className="text-[#00ff88]" />
              <h3 className="text-xl font-bold">Shipping Address</h3>
            </div>
            <div className="space-y-2 text-gray-300">
              <p className="font-bold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Truck size={24} className="text-[#00ff88]" />
              <h3 className="text-xl font-bold">Shipping Method</h3>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-lg">{order.shippingMethod.name}</p>
              <p className="text-gray-400">{order.shippingMethod.description}</p>
              <p className="text-[#00ff88] font-bold mt-4">₹{order.shippingMethod.cost}</p>
              <p className="text-sm text-gray-400 mt-4">
                Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tax (18%)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shipping</span>
              <span>₹{order.shipping.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#00ff88]">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-[#00ff88]">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-[#00ff88]" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-bold">{order.shippingAddress.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-[#00ff88]" />
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="font-bold">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            <Download size={20} />
            Download Invoice
          </button>
          <button
            onClick={() => {
              navigator.share?.({
                title: 'Order Confirmation',
                text: `Check out my order ${order.orderNumber}`,
              });
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            <Share2 size={20} />
            Share Order
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-[#00ff88] text-black font-bold py-3 rounded-lg hover:bg-white transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>

        {/* Tracking Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 text-center"
        >
          <p className="text-blue-300 mb-2">📧 Confirmation email sent to {order.shippingAddress.email}</p>
          <p className="text-gray-400">You can track your order status anytime from your account</p>
        </motion.div>
      </div>
    </div>
  );
};
