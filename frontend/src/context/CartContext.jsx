import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('bella_pizza_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('bella_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bella_pizza_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    if (lastOrder) {
      try {
        localStorage.setItem('bella_last_order', JSON.stringify(lastOrder));
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastOrder]);

  // Add item with custom configuration
  const addToCart = (item) => {
    // Generate unique identifier based on pizza ID, size, crust, and toppings
    const toppingKey = (item.toppings || []).map(t => typeof t === 'string' ? t : t.name).sort().join('|');
    const uniqueId = `${item.pizza_id || item.id}-${item.size_name}-${item.crust_name}-${toppingKey}-${item.special_notes || ''}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === uniqueId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + (item.quantity || 1)
        };
        return next;
      } else {
        return [...prev, { ...item, cartItemId: uniqueId }];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.cartItemId === cartItemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setPromoCode('');
  };

  // Promo code validation
  const applyPromo = (codeToApply) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    setPromoError('');

    if (!code) {
      setPromoError('Please enter a valid coupon code.');
      return false;
    }

    if (code === 'PIZZA20') {
      setAppliedPromo({ code, type: 'percent', value: 0.20, description: '20% Off Total' });
      setPromoCode(code);
      return true;
    } else if (code === 'SAVE5' || code === 'SLICELOVE') {
      setAppliedPromo({ code, type: 'fixed', value: 5.00, description: '$5 Off Instant Voucher' });
      setPromoCode(code);
      return true;
    } else if (code === 'FREESHIP') {
      setAppliedPromo({ code, type: 'shipping', value: 0, description: 'Free Express Delivery' });
      setPromoCode(code);
      return true;
    } else {
      setPromoError('Invalid coupon code. Try PIZZA20 or SAVE5.');
      return false;
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
  
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discount = subtotal * appliedPromo.value;
    } else if (appliedPromo.type === 'fixed') {
      discount = Math.min(appliedPromo.value, subtotal);
    }
  }

  const baseDeliveryFee = 2.99;
  let deliveryFee = baseDeliveryFee;
  if (subtotal - discount >= 35 || (appliedPromo && appliedPromo.type === 'shipping')) {
    deliveryFee = 0;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + (cart.length > 0 ? deliveryFee : 0) + tax;
  const totalItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
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
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        totalItemCount,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
