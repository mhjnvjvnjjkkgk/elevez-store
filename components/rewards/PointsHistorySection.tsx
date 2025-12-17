import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLoyalty } from '../../hooks/useLoyalty';
import { TrendingUp, TrendingDown, Clock, ShoppingBag, Package, Gift, ChevronRight } from 'lucide-react';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface Order {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  createdAt: any;
  status: string;
}

export const PointsHistorySection: React.FC = () => {
  const navigate = useNavigate();
  const { transactions } = useLoyalty();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Fetch user and their orders
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const { getUserOrders } = await import('../../services/userService');
          const result = await getUserOrders(currentUser.uid);
          if (result.success) {
            setOrders(result.data);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculate points earned from order (₹100 = 10 points)
  const calculateOrderPoints = (orderTotal: number) => {
    return Math.floor(orderTotal / 10);
  };

  // Merge transactions with orders for complete history
  const getCompleteHistory = () => {
    const history: any[] = [];

    // Add transactions
    transactions.forEach(transaction => {
      // Determine if this is a positive (earning) transaction
      // Admin adjustments with positive points should show as 'earn'
      const isEarning =
        transaction.type === 'earn' ||
        transaction.type === 'admin_add' ||
        (transaction.type === 'admin-adjustment' && transaction.points > 0) ||
        (transaction.reason?.toLowerCase().includes('added') && transaction.points > 0);

      history.push({
        id: transaction.id,
        type: isEarning ? 'earn' : 'redeem',
        points: Math.abs(transaction.points), // Always show absolute value
        reason: transaction.reason || (isEarning ? 'Admin adjustment' : 'Points redeemed'),
        timestamp: transaction.timestamp,
        source: 'transaction'
      });
    });

    // Add orders
    orders.forEach(order => {
      const pointsEarned = calculateOrderPoints(order.totalAmount);
      history.push({
        id: order.id,
        type: 'earn',
        points: pointsEarned,
        reason: `Order #${order.id.slice(-6)}`,
        orderDetails: order.items,
        orderTotal: order.totalAmount,
        timestamp: order.createdAt,
        source: 'order'
      });
    });

    // Sort by timestamp (newest first)
    return history.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(0);
      const timeB = b.timestamp?.toDate?.() || new Date(0);
      return timeB - timeA;
    });
  };

  const completeHistory = getCompleteHistory();

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full mx-auto"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Points History</h2>
          <p className="text-xl text-white/70">Track all your points activity and orders</p>
        </motion.div>

        {completeHistory.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#00ff88]/10 to-purple-500/10 backdrop-blur-xl 
                     rounded-3xl p-12 border border-[#00ff88]/20 text-center"
          >
            <Clock className="w-16 h-16 text-[#00ff88]/50 mx-auto mb-4" />
            <p className="text-white/70 text-lg mb-2">No activity yet</p>
            <p className="text-white/50 text-sm">Start shopping to earn points!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {completeHistory.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => item.source === 'order' && navigate(`/order/${item.id}`)}
                  disabled={item.source !== 'order'}
                  className={`w-full text-left bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-xl 
                           rounded-2xl p-6 border border-white/10 hover:border-[#00ff88]/30
                           transition-all duration-300 group relative overflow-hidden
                           ${item.source === 'order' ? 'cursor-pointer hover:bg-black/70' : 'cursor-default'}`}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/0 via-[#00ff88]/5 to-[#00ff88]/0 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Icon and Details */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                                      ${item.type === 'earn'
                            ? 'bg-gradient-to-br from-[#00ff88]/20 to-green-500/20 border border-[#00ff88]/30'
                            : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30'
                          }`}>
                          {item.source === 'order' ? (
                            <ShoppingBag className="w-7 h-7 text-[#00ff88]" />
                          ) : item.type === 'earn' ? (
                            <TrendingUp className="w-7 h-7 text-[#00ff88]" />
                          ) : (
                            <TrendingDown className="w-7 h-7 text-red-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-lg mb-1">{item.reason}</p>

                          {/* Order details if available */}
                          {item.orderDetails && (
                            <div className="mt-2 space-y-1">
                              {item.orderDetails.slice(0, 2).map((orderItem: any, idx: number) => (
                                <p key={idx} className="text-white/50 text-sm">
                                  {orderItem.quantity}x {orderItem.name}
                                </p>
                              ))}
                              {item.orderDetails.length > 2 && (
                                <p className="text-white/40 text-xs">
                                  +{item.orderDetails.length - 2} more items
                                </p>
                              )}
                              <p className="text-[#00ff88]/70 text-sm font-semibold mt-2">
                                Order Total: ₹{item.orderTotal?.toFixed(2)}
                              </p>
                            </div>
                          )}

                          <p className="text-white/40 text-sm mt-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {item.timestamp?.toDate?.()?.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) || 'Recent'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Points and Action */}
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <p className={`text-4xl font-black font-syne ${item.type === 'earn' ? 'text-[#00ff88]' : 'text-red-400'
                          }`}
                          style={{
                            textShadow: item.type === 'earn'
                              ? '0 0 20px rgba(0, 255, 136, 0.3)'
                              : '0 0 20px rgba(239, 68, 68, 0.3)'
                          }}>
                          {item.type === 'earn' ? '+' : '-'}{item.points}
                        </p>
                        <p className="text-white/50 text-xs uppercase tracking-wider">points</p>
                        {item.source === 'order' && (
                          <div className="mt-2 flex items-center gap-1 text-[#00ff88] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            View Order
                            <ChevronRight size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};
