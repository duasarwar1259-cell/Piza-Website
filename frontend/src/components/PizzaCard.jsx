import React from 'react';
import { Star, Flame, Leaf, Clock, Plus, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const PizzaCard = ({ pizza, onCustomize }) => {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart({
      pizza_id: pizza.id,
      pizza_name: pizza.name,
      size_name: 'Medium (10")',
      crust_name: 'Classic Stone-Baked',
      toppings: [],
      special_notes: '',
      quantity: 1,
      unit_price: parseFloat(pizza.base_price),
      image_url: pizza.image_url,
    });
  };

  return (
    <div
      onClick={() => onCustomize(pizza)}
      className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <img
            src={pizza.image_url}
            alt={pizza.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />

          {/* Gradient Overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {pizza.is_bestseller && (
              <span className="bg-orange-500 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                ★ Best Seller
              </span>
            )}
            {pizza.is_veg && (
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Veg
              </span>
            )}
            {pizza.is_spicy && (
              <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" /> Spicy
              </span>
            )}
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-stone-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{pizza.prep_time}</span>
          </div>

          <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-md text-stone-200 text-xs px-2 py-1 rounded-lg font-mono">
            {pizza.calories} kcal
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              {pizza.category_name || 'Artisanal'}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{parseFloat(pizza.rating || 4.9).toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({pizza.reviews_count || 120})</span>
            </div>
          </div>

          <h3 className="text-lg font-black text-stone-900 font-serif leading-snug group-hover:text-orange-600 transition">
            {pizza.name}
          </h3>

          <p className="text-stone-600 text-xs mt-2 line-clamp-2 leading-relaxed">
            {pizza.description}
          </p>

          {/* Ingredients tags if any */}
          {pizza.ingredients && pizza.ingredients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {pizza.ingredients.slice(0, 3).map((ing, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium"
                >
                  {ing}
                </span>
              ))}
              {pizza.ingredients.length > 3 && (
                <span className="text-[10px] text-stone-400 self-center">
                  +{pizza.ingredients.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="p-5 pt-0 mt-2 border-t border-stone-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-stone-500 uppercase font-semibold block">Starts at</span>
          <span className="text-xl font-black text-stone-900 font-mono">
            ${parseFloat(pizza.base_price).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick add default */}
          <button
            onClick={handleQuickAdd}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
            title="Quick add Medium standard"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Customize Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCustomize(pizza);
            }}
            className="px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>
      </div>
    </div>
  );
};
