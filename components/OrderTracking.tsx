import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, getOrder } from '../services/checkoutService';

export const OrderTracking: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!orderId) {
        setError('Order ID not found');
        return;
      }

      const result = await getOrder(orderId);
      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        setError(result.error || 'Failed to load order');
      }
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Order not found'}</p>
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

  const timeline = [
    {
      status: 'pending',
      label: 'Order Placed',
      date: order.createdAt,
      completed: true,
      icon: Package,
    },
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      date: order.updatedAt,
      completed: order.status !== 'pending',
      icon: CheckCircle,
    },
    {
      status: 'processing',
      label: 'Processing',
      date: order.updatedAt,
      completed: ['processing', 'shipped', 'delivered'].includes(order.status),
      icon: Clock,
    },
    {
      status: 'shipped',
      label: 'Shipped',
      date: order.updatedAt,
      completed: ['shipped', 'delivered'].includes(order.status),
      icon: Truck,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      date: order.estimatedDelivery,
      completed: order.status === 'delivered',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-400 text-lg">Order #{order.orderNumber}</p>
        </motion.div>

        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-400 text-sm mb-2">Current Status</p>
              <p className="text-2xl font-bold capitalize text-[#00ff88]">{order.status}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Order Date</p>
              <p className="text-2xl font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Estimated Delivery</p>
              <p className="text-2xl font-bold">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-8">Order Timeline</h2>
          <div className="space-y-8">
            {timeline.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-6">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-[#00ff88] text-black'
                          : 'bg-zinc-800 text-gray-400'
                      }`}
                    >
                      <Icon size={24} />
                    </motion.div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`w-1 h-12 mt-2 ${
                          step.completed ? 'bg-[#00ff88]' : 'bg-zinc-700'
                        }`}
                      />
                    )}
                  </div>

                  {/* Timeline content */}
                  <div className="pt-2 pb-8">
                    <h3 className="text-lg font-bold mb-1">{step.label}</h3>
                    <p className="text-gray-400">
                      {new Date(step.date).toLocaleDateString()} at{' '}
                      {new Date(step.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
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

          {/* Contact Info */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
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
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h3 className="text-xl font-bold mb-6">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-white/10 last:border-0">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-20 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{item.productName}</h4>
                  <p className="text-sm text-gray-400">
                    {item.size} • {item.color} • Qty: {item.quantity}
                  </p>
                  <p className="text-[#00ff88] font-bold mt-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h3 className="text-xl font-bold mb-6">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tax</span>
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

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/')}
          className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-lg hover:bg-white transition-colors"
        >
          Continue Shopping
        </motion.button>
      </div>
    </div>
  );
};
