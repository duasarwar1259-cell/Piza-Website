import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    promoCode,
    setPromoCode,
    appliedPromo,
    promoError,
    applyPromo,
    removePromo,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    totalItemCount
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 35.00;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - (subtotal - discount));
  const deliveryProgress = Math.min(100, Math.round(((subtotal - discount) / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-stone-900 font-serif leading-tight">Your Pizza Cart</h2>
                <p className="text-xs text-stone-500 font-medium">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in basket
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-stone-500 hover:text-red-600 font-semibold transition"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Meter */}
          {cart.length > 0 && (
            <div className="bg-orange-50/80 border-b border-orange-100 px-5 py-3 text-xs">
              {deliveryFee === 0 ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>🎉 You have qualified for FREE Priority Delivery!</span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between font-semibold text-stone-700 mb-1">
                    <span>Add <strong>${amountNeededForFreeDelivery.toFixed(2)}</strong> for FREE delivery!</span>
                    <span className="font-mono text-orange-600">{deliveryProgress}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${deliveryProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drawer Cart Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-4xl mb-4">
                  🍕
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-1">Your cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Craving freshly baked Neapolitan pizza? Explore our menu and build your custom slice.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Start Ordering Now
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.pizza_name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-stone-100"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 leading-snug">{item.pizza_name}</h4>
                        <div className="text-xs text-stone-600 mt-0.5 font-medium">
                          {item.size_name} • {item.crust_name}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-stone-300 hover:text-red-500 transition p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toppings & Notes pills */}
                  {((item.toppings && item.toppings.length > 0) || item.special_notes) && (
                    <div className="text-[11px] bg-stone-50 p-2 rounded-xl border border-stone-100 space-y-1">
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="text-stone-600 flex flex-wrap gap-1">
                          <span className="font-semibold text-stone-500">Toppings:</span>
                          {item.toppings.map((t, idx) => (
                            <span key={idx} className="bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-medium text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.special_notes && (
                        <div className="text-stone-500 italic">
                          "{item.special_notes}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-sm font-black font-mono text-stone-900">
                      ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
              
              {/* Promo Code Input */}
              <div>
                {appliedPromo ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applied: <strong>{appliedPromo.code}</strong> ({appliedPromo.description})</span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-stone-400 hover:text-red-500 text-xs font-bold transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. PIZZA20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase font-mono"
                      />
                      <button
                        onClick={() => applyPromo()}
                        className="px-3.5 py-2 bg-stone-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-red-600 font-medium pl-1">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Calculations Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-mono font-medium">
                    {deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono font-medium">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-orange-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/25 flex items-center justify-center gap-2 transition active:scale-95 text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Stone-Baked Hot & Fresh Guarantee</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
