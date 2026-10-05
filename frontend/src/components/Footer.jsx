import React from 'react';
import { Pizza, Phone, MapPin, Clock, Heart, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer id="about" className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="container mx-auto px-4">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Pizza className="w-5 h-5 -rotate-12" />
              </div>
              <span className="text-2xl font-black font-serif text-white tracking-tight">
                Bella<span className="text-orange-500">Crust</span>
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Handcrafting wood-fired Neapolitan pizzas with naturally fermented dough, San Marzano D.O.P. tomatoes, and artisanal fior di latte since 2018.
            </p>
            <div className="pt-2 text-xs text-stone-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Stone ovens firing right now</span>
            </div>
          </div>

          {/* Col 2: Store Hours */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Baking & Delivery Hours</span>
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li className="flex justify-between">
                <span>Monday - Thursday:</span>
                <span className="text-stone-200 font-mono">11:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday - Saturday:</span>
                <span className="text-orange-400 font-mono font-bold">11:00 AM - 02:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday Brunch & Night:</span>
                <span className="text-stone-200 font-mono">12:00 PM - 11:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Location & Hotline */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Location & Contact</span>
            </h4>
            <div className="text-xs space-y-2 text-stone-400">
              <p>📍 142 Stone Oven Lane, Little Italy District, NY 10013</p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <a href="tel:+18005557499" className="hover:text-white transition font-mono">
                  1-800-555-PIZZA (7499)
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>hello@bellacrustpizza.com</span>
              </p>
            </div>
          </div>

          {/* Col 4: Newsletter & Secret Deals */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>VIP Pizza Club</span>
            </h4>
            <p className="text-xs text-stone-400">
              Subscribe to get secret weekly coupons, free cheesy garlic bread vouchers, and chef specials.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="bg-stone-800 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 flex-1"
              />
              <button
                type="button"
                onClick={() => alert('Thanks for joining the VIP Pizza Club! Use code VIPPIZZA for free garlic knots on your next order.')}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
              >
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Bella Crust Pizza Co. All rights reserved.</p>

          <div className="flex items-center gap-2 font-mono text-[11px] bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700/60">
            <span className="text-orange-400 font-bold">Stack:</span>
            <span>React + Tailwind CSS + Node.js Express + PostgreSQL 18</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
