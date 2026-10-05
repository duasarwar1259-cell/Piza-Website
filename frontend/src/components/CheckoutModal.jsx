import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Truck, Store, CreditCard, Banknote, ShieldCheck, Loader2, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as yup from 'yup';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const checkoutValidationSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  email: yup.string().trim().email('Invalid email address').required('Email is required'),
  phone: yup.string().trim().required('Phone number is required'),
  address: yup.string().when('$orderType', {
    is: 'delivery',
    then: (schema) => schema.trim().required('Delivery address is required'),
    otherwise: (schema) => schema.nullable(),
  }),
});

export const CheckoutModal = ({ isOpen, onClose, onOrderComplete }) => {
  const { cart, subtotal, discount, deliveryFee, tax, total, appliedPromo, clearCart, setLastOrder } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'pickup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    instructions: '',
    paymentMethod: 'cash',
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user && isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFormErrors({});

    try {
      await checkoutValidationSchema.validate(formData, {
        abortEarly: false,
        context: { orderType },
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = {};
        err.inner.forEach((item) => {
          errors[item.path] = item.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    try {
      setLoading(true);

      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? formData.address : 'In-Store Pickup (142 Main St)',
        instructions: formData.instructions,
        payment_method: formData.paymentMethod,
        promo_code: appliedPromo?.code || '',
        items: cart.map((i) => ({
          pizza_id: i.pizza_id,
          pizza_name: i.pizza_name,
          size_name: i.size_name,
          crust_name: i.crust_name,
          toppings: i.toppings || [],
          special_notes: i.special_notes || '',
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.data) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.error(e);
        }

        setLastOrder(res.data);
        clearCart();
        onClose();
        onOrderComplete(res.data);
      } else {
        setErrorMsg(res.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Network error while placing order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black font-serif text-stone-900">Complete Your Order</h2>
            <p className="text-xs text-stone-500 font-medium">Fast delivery directly from our stone-fired oven</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Delivery or Pickup Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition ${
                  orderType === 'delivery'
                    ? 'border-orange-600 bg-orange-50 text-orange-900'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <Truck className="w-4 h-4 text-orange-600" />
                <span>Delivery (30-40 mins)</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition ${
                  orderType === 'pickup'
                    ? 'border-orange-600 bg-orange-50 text-orange-900'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <Store className="w-4 h-4 text-orange-600" />
                <span>Store Pickup (15 mins)</span>
              </button>
            </div>
          </div>

          {/* Logged in member badge */}
          {isAuthenticated && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800 font-semibold">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Logged in as <strong>{user?.name}</strong> ({user?.email})</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
                Profile Auto-Filled
              </span>
            </div>
          )}

          {/* Customer Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                    formErrors.name ? 'border-red-500 bg-red-50/20' : 'border-stone-200'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. (555) 234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                    formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-stone-200'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. john@example.com (for order receipt)"
                value={formData.email}
                onChange={handleChange}
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                  formErrors.email ? 'border-red-500 bg-red-50/20' : 'border-stone-200'
                }`}
              />
              {formErrors.email && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{formErrors.email}</p>
              )}
            </div>
          </div>

          {/* Delivery Address (if delivery) */}
          {orderType === 'delivery' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Delivery Destination
              </h3>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Street Address & Apartment/Unit *</label>
                <input
                  type="text"
                  name="address"
                  required={orderType === 'delivery'}
                  placeholder="e.g. 104 Willow Street, Apt 3B, Downtown"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Drop-off / Courier Notes</label>
                <input
                  type="text"
                  name="instructions"
                  placeholder="e.g. Buzz code #4521, please don't ring bell"
                  value={formData.instructions}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
                />
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  formData.paymentMethod === 'cash'
                    ? 'border-orange-600 bg-orange-50/70 text-orange-950'
                    : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <Banknote className="w-4 h-4 text-emerald-600" />
                <div className="text-xs font-bold">Cash on Delivery / Pickup</div>
              </label>

              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  formData.paymentMethod === 'card'
                    ? 'border-orange-600 bg-orange-50/70 text-orange-950'
                    : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <CreditCard className="w-4 h-4 text-blue-600" />
                <div className="text-xs font-bold">Credit / Debit Card (Instant)</div>
              </label>
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1.5">
            <div className="font-bold text-stone-800 mb-2">Order Review ({cart.length} unique items)</div>
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({appliedPromo?.code}):</span>
                <span className="font-mono">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Delivery:</span>
              <span className="font-mono">{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tax (8%):</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="font-mono text-orange-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Confirming Order with Kitchen...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Confirm Order • ${total.toFixed(2)}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Checkout • Prepared by Bella Crust Masters</span>
          </div>

        </form>

      </div>
    </div>
  );
};
