// Order History Component - Shows all user orders with persistence
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useUserOrders } from '../hooks/useUserOrders';
import { UserOrder } from '../services/firebaseSyncService';
import { useNavigate } from 'react-router-dom';

export const OrderHistory: React.FC = () => {
  const { orders, loading, error, hasOrders } = useUserOrders();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      case 'pending':
      case 'processing':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Package className="text-blue-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'pending':
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const formatDate = (dateString: string | any) => {
    let date: Date;
    
    // Handle Firestore Timestamp objects
    if (dateString && typeof dateString === 'object' && 'toDate' in dateString) {
      date = dateString.toDate();
    } else if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <XCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasOrders) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="text-gray-600 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
          <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/shop')}
            className="bg-[#00ff88] text-black px-8 py-3 rounded-lg font-bold"
          >
            Start Shopping
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-gray-400">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-[#00ff88]/50 transition-colors"
            >
              {/* Order Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="text-white font-medium">{order.items?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-white font-medium">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                    <p className="text-white font-medium capitalize">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Shipping</p>
                    <p className="text-white font-medium">{formatCurrency(order.shipping)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Points Earned</p>
                    <p className="text-[#00ff88] font-bold flex items-center gap-1">
                      <Star size={14} className="fill-[#00ff88]" />
                      {order.pointsEarned || Math.floor(order.total / 10)}
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full flex items-center justify-center gap-2 text-[#00ff88] hover:text-white transition-colors py-2 border-t border-zinc-800"
                >
                  {expandedOrder === order.id ? (
                    <>
                      <span>Hide Details</span>
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      <span>View Details</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Order Details */}
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-800 bg-zinc-950"
                  >
                    <div className="p-6">
                      {/* Items */}
                      <div className="mb-6">
                        <h4 className="text-white font-bold mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-4 bg-zinc-900 p-3 rounded-lg">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-white font-medium">{item.name}</p>
                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-white font-bold">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="mb-6">
                          <h4 className="text-white font-bold mb-3">Shipping Address</h4>
                          <div className="bg-zinc-900 p-4 rounded-lg text-gray-300">
                            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && <p className="mt-2">Phone: {order.shippingAddress.phone}</p>}
                          </div>
                        </div>
                      )}

                      {/* Price Breakdown */}
                      <div>
                        <h4 className="text-white font-bold mb-3">Price Breakdown</h4>
                        <div className="bg-zinc-900 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between text-gray-300">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Tax</span>
                            <span>{formatCurrency(order.tax)}</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Shipping</span>
                            <span>{formatCurrency(order.shipping)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-400">
                              <span>Discount</span>
                              <span>-{formatCurrency(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-zinc-800">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                          </div>
                          <div className="flex justify-between text-[#00ff88] font-bold pt-2 border-t border-zinc-800">
                            <span className="flex items-center gap-2">
                              <Star size={16} className="fill-[#00ff88]" />
                              Points Earned
                            </span>
                            <span>{order.pointsEarned || Math.floor(order.total / 10)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
