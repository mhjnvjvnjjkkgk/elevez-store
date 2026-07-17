import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Package, Calendar, MapPin, CreditCard, 
  Truck, CheckCircle, Clock, AlertCircle, Printer
} from 'lucide-react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { PRODUCTS } from '../constants';

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
  trackingLink?: string | null;
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
      <div className="min-h-screen pt-24 pb-20 bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate('/account?tab=orders')}
            className="flex items-center gap-2 text-black hover:opacity-75 transition-opacity mb-8 font-black uppercase text-xs tracking-wider"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>
          <div className="bg-white border-[3px] border-black p-12 text-center shadow-[6px_6px_0px_0px_#000]">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-black uppercase mb-2">Order Not Found</h2>
            <p className="text-zinc-500 font-bold uppercase text-xs">We couldn't locate this order in your profile history.</p>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
  
  let orderDateStr = 'N/A';
  let orderTimeStr = '';
  try {
    orderDateStr = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    orderTimeStr = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {}

  const steps = [
    { key: 'ordered', label: 'Ordered', icon: Clock, checked: true },
    { key: 'processing', label: 'Processing', icon: Package, checked: ['processing', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) },
    { key: 'shipped', label: 'Shipped', icon: Truck, checked: ['shipped', 'delivered'].includes(order.status?.toLowerCase()) },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, checked: order.status?.toLowerCase() === 'delivered' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-zinc-50 text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/account?tab=orders')}
          className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity mb-6 font-black uppercase text-xs tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </button>

        {/* Main Details Card */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          
          {/* Header Row */}
          <div className="bg-black text-white p-4 sm:p-5 flex items-center justify-between border-b-[3px] border-black">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00ff88]">Order Detail View</span>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-widest text-white mt-0.5">Order Details</h1>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#00ff88] text-black px-3 py-1.5 border-[2px] border-black font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_#fff] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              <Printer size={12} />
              Print Invoice
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Delivery Progress Bar */}
            {order.status?.toLowerCase() !== 'cancelled' ? (
              <div className="bg-zinc-50 border-[2px] border-black p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-4">Delivery Status Timeline</p>
                <div className="relative flex items-center justify-between mt-2 px-2 sm:px-6">
                  {/* Progress Line */}
                  <div className="absolute left-6 right-6 top-[18px] h-1 bg-zinc-200 z-0" />
                  <div 
                    className="absolute left-6 top-[18px] h-1 bg-[#00ff88] border-y border-black z-0 transition-all duration-700" 
                    style={{
                      width: order.status?.toLowerCase() === 'delivered' ? 'calc(100% - 48px)' : order.status?.toLowerCase() === 'shipped' ? '66%' : order.status?.toLowerCase() === 'processing' ? '33%' : '0%'
                    }}
                  />
                  
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCurrent = order.status?.toLowerCase() === step.key || (step.key === 'ordered' && (order.status?.toLowerCase() === 'pending' || !order.status));
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center flex-1">
                        <div 
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-[2px] border-black transition-all duration-500 ${
                            step.checked 
                              ? 'bg-[#00ff88] text-black shadow-[2px_2px_0px_0px_#000]' 
                              : 'bg-white text-zinc-400'
                          } ${isCurrent ? 'ring-4 ring-[#00ff88]/30 scale-105' : ''}`}
                        >
                          <StepIcon size={14} className="sm:size-4" />
                        </div>
                        <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider mt-2.5 text-center leading-tight ${step.checked ? 'text-black' : 'text-zinc-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-[2px] border-red-600 p-4 text-center">
                <span className="text-xs font-black uppercase tracking-widest text-red-600">This order was cancelled</span>
              </div>
            )}

            {/* Live Shipment Tracking Banner */}
            {order.trackingLink && (
              <div className="bg-[#00ff88] border-[2px] border-black p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[3px_3px_0px_0px_#000]">
                <div>
                  <h3 className="text-xs font-black uppercase text-black">Live Tracking Information</h3>
                  <p className="text-[10px] font-bold text-black/70 uppercase">Your package is in shipment. Click track package below to open the carrier link.</p>
                </div>
                <a
                  href={order.trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-[#00ff88] px-5 py-2 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[2px_2px_0px_0px_#fff] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-center whitespace-nowrap cursor-pointer"
                >
                  Track Package 🚚
                </a>
              </div>
            )}

            {/* Order Items */}
            <div className="border-[2px] border-black p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-200 pb-2 mb-3">Items Purchased</p>
              <div className="divide-y divide-zinc-100">
                {order.items?.map((item, idx) => {
                  const fallbackImage = item.image || PRODUCTS.find(p => String(p.id) === String(item.id))?.image || '';
                  return (
                    <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="w-14 h-18 sm:w-16 sm:h-20 shrink-0 border-[1.5px] border-black overflow-hidden bg-zinc-100">
                        {fallbackImage ? (
                          <img
                            src={fallbackImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[9px] uppercase font-black">No Pic</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight text-black truncate">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase text-zinc-500 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-xs sm:text-sm">₹{item.price}</p>
                        {item.quantity > 1 && (
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">
                            ₹{(item.price * item.quantity)} total
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Details + Price Summary Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              
              <div className="space-y-4">
                {/* Shipping info */}
                <div className="border-[2px] border-black p-4 bg-white shadow-[2px_2px_0px_0px_#000] h-fit">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Delivery Details</p>
                  <p className="text-xs font-black uppercase text-black mb-1">{order.fullName || 'Customer'}</p>
                  <div className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase">
                    <p>{order.address}</p>
                    <p>{order.city}, {order.state} {order.pincode}</p>
                    {order.phone && <p className="mt-2 text-black">Phone: {order.phone}</p>}
                    {order.email && <p className="text-black">Email: {order.email}</p>}
                  </div>
                </div>

                {/* Payment info */}
                <div className="border-[2px] border-black p-4 bg-white shadow-[2px_2px_0px_0px_#000]">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Payment Details</p>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
                    <CreditCard size={14} className="text-zinc-500" />
                    <span>{order.paymentMethod || 'UPI'} • PAID</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="border-[2px] border-black p-4 bg-white shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-3">Order Price Details</p>
                  <div className="space-y-2 text-xs font-bold uppercase text-zinc-500">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="text-black font-black">₹{order.subtotal || order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="text-black font-black">{(order.shippingCost || 0) === 0 ? 'FREE' : `₹${order.shippingCost}`}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t-[2px] border-black pt-3 mt-4 flex justify-between items-baseline">
                  <span className="text-xs font-black uppercase text-black font-syne">Total Amount</span>
                  <span className="text-lg font-black text-black">₹{order.totalAmount}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
