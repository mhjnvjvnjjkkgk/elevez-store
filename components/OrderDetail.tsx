import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Package, Calendar, MapPin, CreditCard, 
  Truck, Check, Clock, AlertCircle, Download, Share2 
} from 'lucide-react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
}

interface OrderData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  createdAt: any;
}

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;

      try {
        const { getOrderById } = await import('../services/orderService');
        const result = await getOrderById(orderId, user.uid);
        if (result.success) {
          setOrder(result.data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#00ff88] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-gray-400">We couldn't find this order. It may have been deleted or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt?.toDate?.() || new Date();
  const estimatedDelivery = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const pointsEarned = Math.floor(order.totalAmount / 10);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#00ff88] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Rewards
          </button>

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-5xl font-black font-syne text-white mb-2">Order Details</h1>
              <p className="text-gray-400 text-lg">Order #{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex gap-3">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Download size={20} className="text-[#00ff88]" />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Share2 size={20} className="text-[#00ff88]" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#00ff88]/10 to-cyan-500/10 backdrop-blur-xl 
                       rounded-3xl p-8 border border-[#00ff88]/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#00ff88]/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-[#00ff88]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Order Confirmed</h2>
                  <p className="text-gray-400">Placed on {orderDate.toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Status</p>
                  <p className="text-white font-bold capitalize">{order.status || 'Processing'}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Payment</p>
                  <p className="text-white font-bold capitalize">{order.paymentMethod === 'upi' ? 'UPI' : 'COD'}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Delivery</p>
                  <p className="text-white font-bold">3 Days</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Points Earned</p>
                  <p className="text-[#00ff88] font-bold text-lg">+{pointsEarned}</p>
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Package className="text-[#00ff88]" size={28} />
                Order Items
              </h3>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-black/40 rounded-2xl p-6 border border-white/10 hover:border-[#00ff88]/30 
                             transition-all duration-300 group"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      {item.image && (
                        <div className="w-32 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/10">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            style={{ imageRendering: 'high-quality' }}
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-3">{item.name}</h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {item.size && (
                            <div>
                              <p className="text-white/60 text-sm mb-1">Size</p>
                              <p className="text-white font-semibold">{item.size}</p>
                            </div>
                          )}
                          {item.color && (
                            <div>
                              <p className="text-white/60 text-sm mb-1">Color</p>
                              <p className="text-white font-semibold">{item.color}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-white/60 text-sm mb-1">Quantity</p>
                            <p className="text-white font-semibold">{item.quantity}x</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm mb-1">Price</p>
                            <p className="text-[#00ff88] font-bold">₹{item.price.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <p className="text-right text-lg font-bold">
                            Subtotal: <span className="text-[#00ff88]">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MapPin className="text-[#00ff88]" size={28} />
                Shipping Address
              </h3>

              <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                <p className="text-white font-bold text-lg mb-4">{order.fullName}</p>
                <div className="space-y-2 text-gray-300">
                  <p>{order.address}</p>
                  <p>{order.city}, {order.state} {order.pincode}</p>
                  <p className="text-white/60 text-sm mt-4">Phone: {order.phone}</p>
                  <p className="text-white/60 text-sm">Email: {order.email}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Scrolls with page */}
          <div className="space-y-6">
            {/* Product Mockups */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-6">Product Mockups</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 + index * 0.1 }}
                    className="bg-black/40 rounded-2xl p-4 border border-white/10 hover:border-[#00ff88]/30 transition-all"
                  >
                    {item.image && (
                      <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-[#00ff88]/10 to-purple-500/10 p-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-contain"
                          style={{ imageRendering: 'high-quality' }}
                        />
                        <div className="absolute top-2 right-2 bg-[#00ff88]/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-[#00ff88]/30">
                          <p className="text-[#00ff88] text-xs font-bold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-white font-bold text-sm line-clamp-2">{item.name}</p>
                    <p className="text-[#00ff88] font-bold text-sm mt-2">₹{item.price.toFixed(2)}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={order.shippingCost === 0 ? 'text-[#00ff88] font-bold' : ''}>
                    {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-[#00ff88]">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Points Earned */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-500/30">
                <p className="text-white/70 text-sm mb-2">Points Earned</p>
                <p className="text-3xl font-black text-[#00ff88]" style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.5)' }}>
                  +{pointsEarned}
                </p>
                <p className="text-white/50 text-xs mt-2">₹10 = 1 point</p>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-6">Timeline</h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-[#00ff88] rounded-full" />
                    <div className="w-0.5 h-12 bg-[#00ff88]/30" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Order Placed</p>
                    <p className="text-white/60 text-sm">{orderDate.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-white/30 rounded-full" />
                    <div className="w-0.5 h-12 bg-white/10" />
                  </div>
                  <div>
                    <p className="text-white/70 font-bold">Processing</p>
                    <p className="text-white/60 text-sm">In progress</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-white/30 rounded-full" />
                    <div className="w-0.5 h-12 bg-white/10" />
                  </div>
                  <div>
                    <p className="text-white/70 font-bold">Shipped</p>
                    <p className="text-white/60 text-sm">Coming soon</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-white/30 rounded-full" />
                  </div>
                  <div>
                    <p className="text-white/70 font-bold">Delivered</p>
                    <p className="text-white/60 text-sm">Est. {estimatedDelivery.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
