import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Download, Printer, Mail } from 'lucide-react';

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
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'shipped':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} />;
      case 'shipped':
        return <Truck size={20} />;
      case 'processing':
        return <Package size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF or download receipt
    alert('Download functionality - integrate with PDF library');
  };

  const handleEmailReceipt = () => {
    alert('Email receipt functionality');
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal - Fullscreen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 w-full h-full bg-black z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00ff88]/20 to-transparent p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-gray-400">Order #{order.orderNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEmailReceipt}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Email Receipt"
                  >
                    <Mail size={20} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border ${getStatusColor(order.status)} flex items-center gap-3`}>
                    {getStatusIcon(order.status)}
                    <div className="flex-1">
                      <p className="font-bold capitalize">{order.status}</p>
                      <p className="text-sm opacity-80">
                        {order.status === 'delivered' && 'Your order has been delivered'}
                        {order.status === 'shipped' && 'Your order is on the way'}
                        {order.status === 'processing' && 'We are preparing your order'}
                        {order.status === 'pending' && 'Your order is being confirmed'}
                      </p>
                    </div>
                    <p className="text-sm">{new Date(order.date).toLocaleDateString()}</p>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b border-white/10 last:border-0">
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{item.name}</h4>
                            <div className="flex gap-4 text-sm text-gray-400 mt-1">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${item.price.toFixed(2)}</p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-400">
                                ${(item.price * item.quantity).toFixed(2)} total
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Information */}
                  {order.tracking && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Truck size={24} className="text-[#00ff88]" />
                        Tracking Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Carrier:</span>
                          <span className="font-bold">{order.tracking.carrier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tracking Number:</span>
                          <span className="font-mono">{order.tracking.number}</span>
                        </div>
                        {order.tracking.url && (
                          <a
                            href={order.tracking.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-[#00ff88] text-black py-2 px-4 rounded-lg font-bold text-center hover:bg-white transition-colors"
                          >
                            Track Package
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Timeline */}
                  {order.timeline && order.timeline.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-bold mb-4">Order Timeline</h3>
                      <div className="space-y-4">
                        {order.timeline.map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-[#00ff88]" />
                              {index < order.timeline!.length - 1 && (
                                <div className="w-0.5 h-full bg-white/10 my-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="font-bold">{event.status}</p>
                              <p className="text-sm text-gray-400">{event.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(event.date).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shipping:</span>
                        <span>${order.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tax:</span>
                        <span>${order.tax.toFixed(2)}</span>
                      </div>
                      {order.discount && order.discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Discount:</span>
                          <span>-${order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-[#00ff88]">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Customer</h3>
                    <div className="space-y-2">
                      <p className="font-bold">{order.customer.name}</p>
                      <p className="text-sm text-gray-400">{order.customer.email}</p>
                      {order.customer.phone && (
                        <p className="text-sm text-gray-400">{order.customer.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-[#00ff88]" />
                      Shipping Address
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                        {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Billing Address */}
                  {order.billingAddress && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-bold mb-4">Billing Address</h3>
                      <div className="text-sm space-y-1">
                        <p>{order.billingAddress.street}</p>
                        <p>
                          {order.billingAddress.city}, {order.billingAddress.state}{' '}
                          {order.billingAddress.zip}
                        </p>
                        <p>{order.billingAddress.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CreditCard size={20} className="text-[#00ff88]" />
                      Payment
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Method:</span>
                        <span className="font-bold capitalize">{order.payment.method}</span>
                      </div>
                      {order.payment.last4 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Card:</span>
                          <span className="font-mono">•••• {order.payment.last4}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="font-bold text-green-400 capitalize">
                          {order.payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/10 p-6 bg-black/50">
              <div className="flex gap-4 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => alert('Contact support functionality')}
                  className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => alert('Reorder functionality')}
                  className="px-6 py-2 bg-[#00ff88] text-black rounded-lg font-bold hover:bg-white transition-colors"
                >
                  Reorder Items
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
