import React, { useState, useMemo } from 'react';
import { X, Check, Flame, Leaf, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const PizzaCustomizerModal = ({ pizza, options, onClose }) => {
  const { addToCart } = useCart();

  const sizes = options?.sizes || [
    { id: 1, name: 'Personal (8")', code: 'personal', price_multiplier: 0.80, slices: 4, serves: '1 Person' },
    { id: 2, name: 'Medium (10")', code: 'medium', price_multiplier: 1.00, slices: 6, serves: '1-2 Persons' },
    { id: 3, name: 'Large (12")', code: 'large', price_multiplier: 1.35, slices: 8, serves: '2-3 Persons' },
    { id: 4, name: 'Monster XL (16")', code: 'xl', price_multiplier: 1.75, slices: 12, serves: '4-5 Persons' },
  ];

  const crusts = options?.crusts || [
    { id: 1, name: 'Classic Stone-Baked', extra_price: 0.00, description: 'Hand-stretched dough with blistered crust' },
    { id: 2, name: 'Thin & Crispy Roman', extra_price: 0.50, description: 'Ultra-thin, crunch in every bite' },
    { id: 3, name: 'Double Cheese Burst', extra_price: 2.50, description: 'Molten blend of cheddar & mozzarella inside the rim' },
    { id: 4, name: 'Garlic Herb Stuffed Crust', extra_price: 2.25, description: 'Stuffed with melted cheese & roasted garlic herb butter' },
  ];

  const toppings = options?.toppings || [];

  // Selections
  const [selectedSize, setSelectedSize] = useState(sizes[1] || sizes[0]); // default Medium
  const [selectedCrust, setSelectedCrust] = useState(crusts[0]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Group toppings by category
  const groupedToppings = useMemo(() => {
    const map = { cheese: [], meat: [], veggie: [], sauce: [] };
    toppings.forEach((t) => {
      const cat = t.category || 'veggie';
      if (!map[cat]) map[cat] = [];
      map[cat].push(t);
    });
    return map;
  }, [toppings]);

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  // Dynamic Price Computation
  const unitPrice = useMemo(() => {
    const base = parseFloat(pizza.base_price) || 12;
    const sizeMultiplier = parseFloat(selectedSize.price_multiplier) || 1;
    const crustAddon = parseFloat(selectedCrust.extra_price) || 0;
    const toppingsTotal = selectedToppings.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);

    const calculated = (base * sizeMultiplier) + crustAddon + toppingsTotal;
    return Math.round(calculated * 100) / 100;
  }, [pizza.base_price, selectedSize, selectedCrust, selectedToppings]);

  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleAddToCart = () => {
    addToCart({
      pizza_id: pizza.id,
      pizza_name: pizza.name,
      size_name: selectedSize.name,
      crust_name: selectedCrust.name,
      toppings: selectedToppings.map(t => t.name),
      special_notes: specialNotes.trim(),
      quantity: quantity,
      unit_price: unitPrice,
      image_url: pizza.image_url,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Modal Header */}
        <div className="relative border-b border-stone-200 bg-stone-50 p-4 sm:p-6 flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <img
              src={pizza.image_url}
              alt={pizza.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                {pizza.is_veg && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Leaf className="w-2.5 h-2.5" /> Veg
                  </span>
                )}
                {pizza.is_spicy && (
                  <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5" /> Spicy
                  </span>
                )}
                <span className="text-xs text-stone-500 font-medium">{pizza.prep_time}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-stone-900 leading-tight">
                {pizza.name}
              </h2>
              <p className="text-xs text-stone-600 line-clamp-1 mt-0.5 max-w-lg">{pizza.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Step 1: Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Select Pizza Size</span>
              </label>
              <span className="text-xs text-orange-600 font-bold">Required</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sizes.map((s) => {
                const isSelected = selectedSize.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/70 text-orange-950 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-stone-900">{s.name}</div>
                      <div className="text-[11px] text-stone-500">{s.slices} slices • {s.serves}</div>
                    </div>
                    <div className="mt-2 text-xs font-black font-mono text-orange-600">
                      ${(parseFloat(pizza.base_price) * parseFloat(s.price_multiplier)).toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Crust Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Choose Your Crust</span>
              </label>
              <span className="text-xs text-orange-600 font-bold">Required</span>
            </div>

            <div className="space-y-2">
              {crusts.map((c) => {
                const isSelected = selectedCrust.id === c.id;
                const extra = parseFloat(c.extra_price);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrust(c)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/60'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-orange-600 bg-orange-600' : 'border-stone-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-900">{c.name}</div>
                        <div className="text-xs text-stone-500">{c.description}</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold font-mono text-stone-700">
                      {extra > 0 ? `+$${extra.toFixed(2)}` : 'Included'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Extra Toppings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Add Extra Toppings</span>
              </label>
              <span className="text-xs text-stone-400">Optional</span>
            </div>

            {/* Toppings list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {toppings.map((top) => {
                const isChecked = selectedToppings.some((t) => t.id === top.id);
                return (
                  <div
                    key={top.id}
                    onClick={() => toggleTopping(top)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-orange-600 border-orange-600 text-white' : 'border-stone-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold text-stone-800">{top.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-600">
                      +${parseFloat(top.price).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Special Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Special Kitchen Notes / Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Well done crust, light cheese, slice into 8..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
              maxLength={150}
            />
          </div>

        </div>

        {/* Modal Footer / Summary & Add */}
        <div className="border-t border-stone-200 bg-stone-50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            {/* Quantity Controls */}
            <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-stone-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Price breakdown */}
            <div>
              <div className="text-[11px] text-stone-500 font-medium">Total Price</div>
              <div className="text-2xl font-black text-stone-900 font-mono">
                ${totalPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Add to order button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart • ${totalPrice.toFixed(2)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
