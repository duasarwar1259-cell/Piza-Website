import React from 'react';
import { Flame, Clock, Award, ArrowRight, ShieldCheck, Star } from 'lucide-react';

export const Hero = ({ onExploreMenu, onOpenFeaturedCustomizer }) => {
  return (
    <section className="relative overflow-hidden bg-stone-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-stone-800/90 border border-stone-700/80 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-orange-400 backdrop-blur-md">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>AUTHENTIC STONE-BAKED NAPOLETANA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.1] text-stone-100">
              Crave-Worthy Slices, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                Baked in 800° Heat.
              </span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Every crust is hand-stretched from our 72-hour slow-fermented dough, topped with crushed San Marzano D.O.P. tomatoes, fresh buffalo mozzarella, and blistered to crispy perfection.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreMenu}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-base"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-stone-300 text-sm font-medium px-4 py-2 bg-stone-800/50 rounded-xl border border-stone-700/50">
                <span className="text-amber-400 font-bold">20% OFF</span> first order with code <span className="text-white font-mono font-bold bg-stone-700 px-2 py-0.5 rounded">PIZZA20</span>
              </div>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-800/80 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">30 Mins</div>
                  <div className="text-[11px] text-stone-400">Lightning Delivery</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">800° F</div>
                  <div className="text-[11px] text-stone-400">Italian Stone Oven</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">4.9 / 5.0</div>
                  <div className="text-[11px] text-stone-400">3.5k+ Reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Showcase Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Main Visual Image Card */}
            <div className="relative group">
              <div className="w-72 sm:w-96 lg:w-[420px] aspect-square rounded-full p-3 bg-gradient-to-tr from-orange-500/30 via-amber-500/20 to-transparent shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"
                  alt="Delicious Artisanal Pizza"
                  className="w-full h-full object-cover rounded-full shadow-2xl transform group-hover:rotate-6 transition duration-700 ease-out border-4 border-stone-800"
                />

                {/* Floating Badge 1 - Best Seller */}
                <div className="absolute -top-3 -left-3 bg-white/95 backdrop-blur-md text-stone-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-200/50 animate-bounce">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Most Ordered</div>
                    <div className="text-sm font-black text-stone-900">Cupped Pepperoni Honey</div>
                  </div>
                </div>

                {/* Floating Badge 2 - Rating */}
                <div className="absolute -bottom-4 -right-4 bg-stone-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400">4.9 Star Rating</div>
                    <div className="text-xs text-stone-400">Fresh Made to Order</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
