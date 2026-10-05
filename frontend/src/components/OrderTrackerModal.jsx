import React, { useState, useEffect } from 'react';
import { X, Search, Clock, CheckCircle2, Flame, Bike, PackageCheck, AlertCircle, RefreshCw, ChefHat, Phone, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export const OrderTrackerModal = ({ isOpen, onClose, initialOrderNumber }) => {
  const { lastOrder } = useCart();
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber || lastOrder?.order_number || 'ORD-98214');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (numberToTrack) => {
    const num = (numberToTrack || orderNumberInput).trim().toUpperCase();
    if (!num) return;

    try {
      setLoading(true);
      setError('');
      const res = await api.trackOrder(num);
      if (res.success && res.data) {
        setOrderData(res.data);
      } else {
        setError(res.message || 'Order not found');
      }
    } catch (err) {
      console.error(err);
      setError('Could not locate order with that reference number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const target = initialOrderNumber || lastOrder?.order_number || 'ORD-98214';
      setOrderNumberInput(target);
      fetchOrder(target);
    }
  }, [isOpen, initialOrderNumber, lastOrder]);

  if (!isOpen) return null;

  // Order status stage calculation
  const stages = [
    { key: 'received', title: 'Order Confirmed', desc: 'Kitchen received ticket', icon: CheckCircle2 },
    { key: 'preparing', title: 'Prepping & Topping', desc: 'Dough stretched & topped', icon: ChefHat },
    { key: 'baking', title: 'Stone Oven Baking', desc: 'Blistering in 800°F heat', icon: Flame },
    { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'Driver en route in insulated box', icon: Bike },
    { key: 'delivered', title: 'Delivered Fresh', desc: 'Enjoy your hot meal!', icon: PackageCheck },
  ];

  const getStageIndex = (status) => {
    const map = {
      received: 0,
      preparing: 1,
      baking: 2,
      out_for_delivery: 3,
      delivered: 4,
      cancelled: -1,
    };
    return map[status] ?? 0;
  };

  const currentStageIndex = orderData ? getStageIndex(orderData.order_status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-serif text-stone-900 leading-tight">Live Pizza Tracker</h2>
              <p className="text-xs text-stone-500 font-medium">Follow your pizza from the flame to your doorstep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Order Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrder(orderNumberInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Track by Order # (e.g. ORD-98214)"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-stone-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Track</span>}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {orderData && (
            <div className="space-y-6">
              
              {/* Order Info Banner */}
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                    Order Reference
                  </div>
                  <div className="text-xl font-black font-mono text-stone-900">
                    {orderData.order_number}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Placed for {orderData.customer_name} • {orderData.order_type === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-bold text-stone-500 uppercase">Estimated ETA</div>
                  <div className="text-lg font-black font-mono text-stone-900 flex items-center sm:justify-end gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>{orderData.estimated_delivery_time || '25-35 mins'}</span>
                  </div>
                  <button
                    onClick={() => fetchOrder(orderData.order_number)}
                    className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center sm:justify-end gap-1 mt-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh Status</span>
                  </button>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-6">
                  Live Cooking & Delivery Stages
                </h3>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-6 left-6 right-6 h-1 bg-stone-200 -z-0">
                    <div
                      className="h-1 bg-orange-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, (currentStageIndex / (stages.length - 1)) * 100))}%`,
                      }}
                    />
                  </div>

                  {/* Stage items */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {stages.map((stg, idx) => {
                      const Icon = stg.icon;
                      const isCompleted = currentStageIndex >= idx;
                      const isCurrent = currentStageIndex === idx;

                      return (
                        <div key={stg.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-4 ring-orange-200 scale-105'
                                : isCompleted
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                              {stg.title}
                            </div>
                            <div className="text-[10px] text-stone-500 hidden sm:block mt-0.5">
                              {stg.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Delivery Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>Destination & Instructions</span>
                  </div>
                  <p className="text-stone-600 font-medium leading-relaxed">
                    {orderData.delivery_address}
                  </p>
                  {orderData.instructions && (
                    <p className="text-stone-500 italic text-[11px]">
                      Note: "{orderData.instructions}"
                    </p>
                  )}
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span>Contact & Payment</span>
                  </div>
                  <p className="text-stone-600 font-medium">
                    Phone: {orderData.customer_phone}
                  </p>
                  <p className="text-stone-600 font-medium">
                    Email: {orderData.customer_email}
                  </p>
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px] uppercase">
                    {orderData.payment_method} ({orderData.payment_status})
                  </div>
                </div>
              </div>

              {/* Items Ordered Receipt Breakdown */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Order Summary ({orderData.items?.length || 0} items)
                </h4>

                <div className="divide-y divide-stone-100 space-y-2">
                  {orderData.items?.map((item, idx) => (
                    <div key={idx} className="pt-2 flex justify-between items-start text-xs">
                      <div>
                        <div className="font-bold text-stone-900">
                          {item.quantity}x {item.pizza_name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {item.size_name} • {item.crust_name}
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            Extra: {item.toppings.join(', ')}
                          </div>
                        )}
                        {item.special_notes && (
                          <div className="text-[10px] text-amber-700 italic">
                            Note: {item.special_notes}
                          </div>
                        )}
                      </div>

                      <div className="font-bold font-mono text-stone-900">
                        ${parseFloat(item.total_price || item.unit_price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-sm font-black text-stone-900">
                  <span>Total Paid</span>
                  <span className="font-mono text-orange-600">${parseFloat(orderData.total_amount).toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
