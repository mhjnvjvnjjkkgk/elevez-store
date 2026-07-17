import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Download, Printer } from 'lucide-react';
import { PRODUCTS } from '../constants';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  payment: {
    method: string;
    last4?: string;
    status: string;
  };
  tracking?: {
    number: string;
    carrier: string;
    url?: string;
  };
  trackingLink?: string | null;
  timeline?: {
    status: string;
    date: string;
    description: string;
  }[];
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'shipped':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  const steps = [
    { key: 'ordered', label: 'Ordered', icon: Clock, desc: 'Order Placed', checked: true },
    { key: 'processing', label: 'Processing', icon: Package, desc: 'Seller preparing item', checked: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'In Transit', checked: ['shipped', 'delivered'].includes(order.status) },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Package Delivered', checked: order.status === 'delivered' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-3xl h-[90vh] sm:h-auto max-h-[85vh] bg-white border-[3px] border-black rounded-none z-50 overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_#000]"
          >
            {/* Header */}
            <div className="bg-black text-white p-4 sm:p-5 border-b-[3px] border-black flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00ff88]">Order Detail Status</span>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">Order #{order.id.slice(-8).toUpperCase()}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="p-1.5 hover:bg-zinc-800 text-white rounded transition-colors"
                  title="Print invoice"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-zinc-800 text-white rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-black bg-zinc-50">
              
              {/* Amazon-style Status Timeline */}
              {order.status !== 'cancelled' ? (
                <div className="bg-white border-[2.5px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000]">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-4">Delivery Progress</p>
                  <div className="relative flex items-center justify-between mt-2 px-2 sm:px-6">
                    {/* Line behind */}
                    <div className="absolute left-6 right-6 top-[18px] h-1 bg-zinc-200 z-0" />
                    {/* Highlighted active line */}
                    <div 
                      className="absolute left-6 top-[18px] h-1 bg-[#00ff88] border-y border-black z-0 transition-all duration-700" 
                      style={{
                        width: order.status === 'delivered' ? 'calc(100% - 48px)' : order.status === 'shipped' ? '66%' : order.status === 'processing' ? '33%' : '0%'
                      }}
                    />
                    
                    {steps.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCurrent = order.status === step.key || (step.key === 'ordered' && (order.status === 'pending' || !order.status));
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
                <div className="bg-red-50 border-[2.5px] border-red-600 p-4 text-center">
                  <span className="text-xs font-black uppercase tracking-widest text-red-600">This order has been cancelled</span>
                </div>
              )}

              {/* Big prominent Track Shipment CTA */}
              {order.trackingLink && (
                <div className="bg-[#00ff88] border-[2.5px] border-black p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[4px_4px_0px_0px_#000]">
                  <div>
                    <h3 className="text-xs font-black uppercase text-black">Live Shipment Tracking Available</h3>
                    <p className="text-[10px] font-bold text-black/70 uppercase">Use the link below to track the order's real-time transit status.</p>
                  </div>
                  <a
                    href={order.trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-[#00ff88] px-5 py-2.5 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#fff] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-center whitespace-nowrap cursor-pointer"
                  >
                    Track Package 🚚
                  </a>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white border-[2.5px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
                <p className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-200 pb-2">Items in Order</p>
                <div className="divide-y divide-zinc-100">
                  {order.items.map((item) => {
                    const fallbackImage = item.image || PRODUCTS.find(p => String(p.id) === String(item.id))?.image || '';
                    return (
                      <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
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

              {/* Delivery, Payment, and Summary Section */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Shipping & Payment Block */}
                <div className="space-y-4">
                  {/* Delivery Address */}
                  <div className="bg-white border-[2.5px] border-black p-4 shadow-[3px_3px_0px_0px_#000] h-fit">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Delivery Address</p>
                    <p className="text-xs font-black uppercase text-black mb-1">{order.customer.name}</p>
                    <div className="text-[11px] font-bold text-zinc-600 leading-relaxed uppercase">
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      <p>{order.shippingAddress.country}</p>
                      {order.customer.phone && <p className="mt-2 text-black">Phone: {order.customer.phone}</p>}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-white border-[2.5px] border-black p-4 shadow-[3px_3px_0px_0px_#000]">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Payment Mode</p>
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
                      <CreditCard size={14} className="text-zinc-600" />
                      <span>{order.payment.method || 'UPI'} • {order.payment.status || 'PAID'}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-white border-[2.5px] border-black p-4 shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-3">Order Price Details</p>
                    <div className="space-y-2 text-xs font-bold uppercase text-zinc-600">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="text-black font-black">₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span className="text-black font-black">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                      </div>
                      {order.discount && order.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount Applied</span>
                          <span className="font-black">-₹{order.discount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t-[2px] border-black pt-3 mt-4 flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase text-black">Total Amount</span>
                    <span className="text-lg font-black text-black">₹{order.total}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer Actions */}
            <div className="border-t-[3px] border-black p-4 bg-zinc-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="bg-black text-[#00ff88] px-6 py-2 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
