import React, { useState } from 'react';
import { Pizza, ShoppingBag, Clock, ShieldCheck, Menu, X, Sparkles, PhoneCall, User, LogOut, ChevronDown, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenTracker, onOpenAdmin }) => {
  const { totalItemCount, total, setIsCartOpen, lastOrder } = useCart();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminClick = () => {
    if (!isAdmin) {
      openAuthModal('login');
    } else {
      onOpenAdmin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all shadow-sm">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 font-medium flex justify-between items-center">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-stone-300">Stone Oven Burning at 800°F • Average Delivery: <strong className="text-white">28 mins</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-stone-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Use code <strong className="text-amber-400 tracking-wide font-mono">PIZZA20</strong> for 20% OFF
            </span>
            <a href="tel:+18005557499" className="flex items-center gap-1 hover:text-white transition">
              <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
              1-800-BELLA-PIZZA
            </a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white transform hover:rotate-6 transition duration-200">
            <Pizza className="w-6 h-6 transform -rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-stone-900 font-serif">
                Bella<span className="text-orange-600">Crust</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                Artisanal
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 tracking-wide">AUTHENTIC NAPOLETANA & SLICES</p>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-stone-700">
          <button onClick={() => scrollTo('menu')} className="hover:text-orange-600 transition">
            Menu
          </button>
          <button onClick={() => scrollTo('deals')} className="hover:text-orange-600 transition flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Deals & Offers
          </button>
          <button onClick={() => scrollTo('reviews')} className="hover:text-orange-600 transition">
            Reviews
          </button>
          <button onClick={() => scrollTo('about')} className="hover:text-orange-600 transition">
            Our Story
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Order Tracker Button */}
          <button
            onClick={() => onOpenTracker()}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            title="Track Live Order"
          >
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Track Order</span>
            {lastOrder && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Order"></span>
            )}
          </button>

          {/* Kitchen Admin Trigger */}
          <button
            onClick={handleAdminClick}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${
              isAdmin
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100 border-amber-200'
            }`}
            title="Manage Kitchen & Live Orders"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="hidden lg:inline">{isAdmin ? 'Kitchen Console' : 'Kitchen Admin'}</span>
          </button>

          {/* User Authentication Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-800 transition"
              >
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] uppercase font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-xs animate-fade-in">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="font-bold text-stone-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                      {user?.role}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 text-amber-800 font-semibold flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Kitchen Admin Console</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenTracker();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>Track Active Order</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 border-t border-stone-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            >
              <User className="w-4 h-4 text-stone-600" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-orange-500/25 transition active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-sm font-semibold">
              ${total.toFixed(2)}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-3 shadow-lg">
          {isAuthenticated ? (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-stone-900">{user?.name}</p>
                <p className="text-[10px] text-stone-500">{user?.email}</p>
              </div>
              <button onClick={logout} className="text-xs text-red-600 font-bold">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              className="w-full text-left py-2 px-3 font-bold text-orange-600 bg-orange-50 rounded-lg flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Sign In / Register
            </button>
          )}

          <button
            onClick={() => scrollTo('menu')}
            className="w-full text-left py-2 px-3 font-semibold text-stone-800 hover:bg-orange-50 rounded-lg"
          >
            🍕 Full Pizza Menu
          </button>
          <button
            onClick={() => scrollTo('deals')}
            className="w-full text-left py-2 px-3 font-semibold text-stone-800 hover:bg-orange-50 rounded-lg"
          >
            🔥 Special Offers & Coupons
          </button>
          <button
            onClick={() => scrollTo('reviews')}
            className="w-full text-left py-2 px-3 font-semibold text-stone-800 hover:bg-orange-50 rounded-lg"
          >
            ⭐ Customer Reviews
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTracker();
            }}
            className="w-full text-left py-2 px-3 font-semibold text-orange-600 hover:bg-orange-50 rounded-lg flex items-center gap-2"
          >
            <Clock className="w-4 h-4" /> Live Order Tracker
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleAdminClick();
            }}
            className="w-full text-left py-2 px-3 font-semibold text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Kitchen / Admin Console
          </button>
        </div>
      )}
    </header>
  );
};
