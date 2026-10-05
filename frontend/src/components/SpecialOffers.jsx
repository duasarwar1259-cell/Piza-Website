import React, { useState } from 'react';
import { Tag, Sparkles, Check, ArrowRight, Percent, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const SpecialOffers = () => {
  const { applyPromo } = useCart();
  const [copiedCode, setCopiedCode] = useState('');

  const offers = [
    {
      code: 'PIZZA20',
      title: '20% OFF Entire Order',
      desc: 'Valid on all handcrafted pizzas, toppings & crust options.',
      badge: 'Most Popular',
      color: 'from-orange-500 to-amber-500',
      textColor: 'text-orange-600',
      icon: Percent,
    },
    {
      code: 'FREESHIP',
      title: 'Zero Delivery Fee',
      desc: 'Free 30-minute priority delivery directly to your doorstep.',
      badge: 'Free Shipping',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      icon: Truck,
    },
    {
      code: 'SAVE5',
      title: 'Instant $5 Cash Voucher',
      desc: 'Take $5 off automatically when treating your family or friends.',
      badge: 'Weekend Special',
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-600',
      icon: Tag,
    },
  ];

  const handleApply = (code) => {
    applyPromo(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode('');
    }, 2500);
  };

  return (
    <section id="deals" className="py-12 bg-stone-100 border-y border-stone-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Limited Time Sizzling Promotions</span>
            </div>
            <h2 className="text-3xl font-black font-serif text-stone-900 tracking-tight">
              Exclusive Chef Deals & Vouchers
            </h2>
          </div>
          <p className="text-sm text-stone-600 mt-2 md:mt-0 max-w-md">
            Click any voucher code to apply discount directly to your cart at checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const Icon = offer.icon;
            const isApplied = copiedCode === offer.code;

            return (
              <div
                key={offer.code}
                className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Decorative slant bar */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${offer.color} opacity-10 rounded-bl-full pointer-events-none group-hover:scale-125 transition duration-500`}></div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                      {offer.badge}
                    </span>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 text-stone-700">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-stone-600 mb-6 leading-relaxed">{offer.desc}</p>
                </div>

                <div className="pt-4 border-t border-dashed border-stone-200 flex items-center justify-between">
                  <div className="font-mono text-base font-black tracking-widest text-stone-800 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-300">
                    {offer.code}
                  </div>

                  <button
                    onClick={() => handleApply(offer.code)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
