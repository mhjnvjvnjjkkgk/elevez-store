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

    const parseDate = (val: any): Date => {
      if (!val) return new Date(0);
      if (typeof val.toDate === 'function') return val.toDate();
      if (val instanceof Date) return val;
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? new Date(0) : parsed;
    };

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
      const timeA = parseDate(a.timestamp).getTime();
      const timeB = parseDate(b.timestamp).getTime();
      return timeB - timeA;
    });
  };

  const completeHistory = getCompleteHistory();

  if (loading) {
    return (
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 border-[6px] border-black border-t-[#00ff88] animate-spin mx-auto shadow-[6px_6px_0px_0px_#000]" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-20">
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
            Ledger
          </div>
          <h2 className="text-6xl md:text-8xl font-black font-syne text-black uppercase leading-none tracking-tighter">
            POINTS <span className="text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }}>HISTORY</span>
          </h2>
        </div>

        {completeHistory.length === 0 ? (
          <div className="bg-white border-[8px] border-black p-20 text-center shadow-[16px_16px_0px_0px_#000]">
            <Clock size={64} className="mx-auto mb-8 text-black opacity-10" />
            <p className="text-3xl font-black text-black uppercase mb-4 italic">NO ACTIVITY RECORDED</p>
            <p className="text-lg font-bold text-black uppercase opacity-40">COMMENCE OPERATIONS TO ACCUMULATE POINTS.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {completeHistory.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => item.source === 'order' && navigate(`/account`)}
                  disabled={item.source !== 'order'}
                  className={`w-full text-left bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group relative overflow-hidden ${
                    item.source === 'order' ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6 flex-1">
                      <div className={`w-16 h-16 border-[3px] border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#000] ${
                        item.type === 'earn' ? 'bg-[#00ff88] text-black' : 'bg-black text-white'
                      }`}>
                        {item.source === 'order' ? <ShoppingBag size={32} /> : item.type === 'earn' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-2xl font-black uppercase text-black mb-1">{item.reason}</h4>
                        <p className="text-xs font-black uppercase text-black opacity-40 flex items-center gap-2">
                          <Clock size={12} />
                          {item.timestamp?.toDate?.()?.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) || 'RECENT'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-0">
                      <p className={`text-5xl font-black font-syne leading-none mb-1 ${
                        item.type === 'earn' ? 'text-black' : 'text-red-500'
                      }`}>
                        {item.type === 'earn' ? '+' : '-'}{item.points}
                      </p>
                      <p className="text-xs font-black uppercase text-black opacity-40">PTS</p>
                    </div>
                  </div>

                  {item.source === 'order' && (
                    <div className="absolute top-0 right-0 bg-[#00ff88] text-black px-4 py-1 text-[10px] font-black border-l-[3px] border-b-[3px] border-black opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                      View Account
                    </div>
                  )}
                </button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};
