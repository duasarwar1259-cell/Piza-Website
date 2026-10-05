import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Flame, Leaf, Sparkles, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { PizzaCard } from './PizzaCard';
import { PizzaCustomizerModal } from './PizzaCustomizerModal';

export const MenuSection = () => {
  const [pizzas, setPizzas] = useState([]);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  // Modal customizer state
  const [activePizzaForCustomizer, setActivePizzaForCustomizer] = useState(null);

  // Load menu & options
  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pizzasRes, optionsRes] = await Promise.all([
        api.getPizzas({
          category: selectedCategory,
          search: searchQuery,
          veg: vegOnly,
          spicy: spicyOnly,
          bestseller: bestsellerOnly,
          sort: sortBy
        }),
        api.getOptions()
      ]);

      if (pizzasRes.success) {
        setPizzas(pizzasRes.data);
      }
      if (optionsRes.success) {
        setOptions(optionsRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load pizza menu from the backend. Make sure the Node.js server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [selectedCategory, vegOnly, spicyOnly, bestsellerOnly, sortBy]);

  // Debounced search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMenu();
  };

  const categories = [
    { slug: 'all', name: 'All Pizzas', emoji: '🍕' },
    { slug: 'classics', name: 'Timeless Classics', emoji: '🍅' },
    { slug: 'signature', name: "Chef's Signature", emoji: '✨' },
    { slug: 'meat', name: 'Meat Feast', emoji: '🥩' },
    { slug: 'veggie', name: 'Veggie Paradise', emoji: '🥦' },
    { slug: 'spicy', name: 'Fiery & Spicy', emoji: '🌶️' },
  ];

  return (
    <section id="menu" className="py-16 bg-stone-50 min-h-[600px]">
      <div className="container mx-auto px-4">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
            Stone-Baked Artisanal Pizzas
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 mt-2 tracking-tight">
            Explore Our Handcrafted Menu
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            Choose your favorite crust, select gourmet toppings, or customize your own pizza slice from scratch.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200/80 mb-10 space-y-4">
          
          {/* Top Row: Categories Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Search, Dietary Filters, and Sorting */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 border-t border-stone-100">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search pizza by name or ingredient (e.g. truffle, pepperoni)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={loadMenu}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
              />
            </form>

            {/* Quick Dietary Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  vegOnly
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Vegetarian</span>
              </button>

              <button
                type="button"
                onClick={() => setSpicyOnly(!spicyOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  spicyOnly
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Spicy</span>
              </button>

              <button
                type="button"
                onClick={() => setBestsellerOnly(!bestsellerOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  bestsellerOnly
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Best Sellers</span>
              </button>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Pizzas Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
            <p className="text-sm font-semibold text-stone-600">Firing up the oven & loading delicious pizzas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-red-900 mb-1">Failed to Connect to Database</h3>
            <p className="text-xs text-red-700 mb-4">{error}</p>
            <button
              onClick={loadMenu}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
            >
              Retry Connection
            </button>
          </div>
        ) : pizzas.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-md mx-auto">
            <div className="text-5xl mb-3">🍕</div>
            <h3 className="text-lg font-black text-stone-900 mb-1">No Pizzas Matched Your Filter</h3>
            <p className="text-xs text-stone-500 mb-4">Try clearing some of your dietary preferences or search query.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setVegOnly(false);
                setSpicyOnly(false);
                setBestsellerOnly(false);
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pizzas.map((pizza) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                onCustomize={(p) => setActivePizzaForCustomizer(p)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Pizza Customizer Modal */}
      {activePizzaForCustomizer && (
        <PizzaCustomizerModal
          pizza={activePizzaForCustomizer}
          options={options}
          onClose={() => setActivePizzaForCustomizer(null)}
        />
      )}
    </section>
  );
};
