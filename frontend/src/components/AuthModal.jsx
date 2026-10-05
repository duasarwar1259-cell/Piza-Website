import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, ShieldCheck, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginSchema, registerSchema } from '../validators/authSchema';
import * as yup from 'yup';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, login, register } = useAuth();

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [registerErrors, setRegisterErrors] = useState({});

  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  // Handle Login with Yup validation
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setLoginErrors({});

    try {
      await loginSchema.validate(loginData, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = {};
        err.inner.forEach((item) => {
          errors[item.path] = item.message;
        });
        setLoginErrors(errors);
        return;
      }
    }

    try {
      setSubmitting(true);
      await login(loginData);
    } catch (err) {
      setGeneralError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Register with Yup validation
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setRegisterErrors({});

    try {
      await registerSchema.validate(registerData, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = {};
        err.inner.forEach((item) => {
          errors[item.path] = item.message;
        });
        setRegisterErrors(errors);
        return;
      }
    }

    try {
      setSubmitting(true);
      await register(registerData);
    } catch (err) {
      setGeneralError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo one-click shortcuts
  const handleQuickAdminLogin = async () => {
    setLoginData({ email: 'admin@bellacrust.com', password: 'AdminPassword123!' });
    setGeneralError('');
    setLoginErrors({});
    try {
      setSubmitting(true);
      await login({ email: 'admin@bellacrust.com', password: 'AdminPassword123!' });
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickCustomerLogin = async () => {
    setLoginData({ email: 'alex.wright@example.com', password: 'CustomerPassword123!' });
    setGeneralError('');
    setLoginErrors({});
    try {
      setSubmitting(true);
      await login({ email: 'alex.wright@example.com', password: 'CustomerPassword123!' });
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 bg-stone-900 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Bella Crust Member Portal</span>
          </div>
          <h2 className="text-2xl font-black font-serif">
            {authModalTab === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {authModalTab === 'login'
              ? 'Sign in to access order history, rewards, and kitchen controls.'
              : 'Join to earn pizza rewards and enjoy faster checkout.'}
          </p>

          {/* Tab Selector */}
          <div className="mt-4 flex bg-stone-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setGeneralError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authModalTab === 'login'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('register');
                setGeneralError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authModalTab === 'register'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {generalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Fast Demo Access</span>
              </span>
              <span className="text-[10px] bg-amber-200/70 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                Pre-configured
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="py-1.5 px-2 bg-stone-900 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] transition text-center"
              >
                👔 Admin Login
              </button>
              <button
                type="button"
                onClick={handleQuickCustomerLogin}
                className="py-1.5 px-2 bg-white hover:bg-amber-100 text-stone-800 border border-amber-300 rounded-lg font-bold text-[11px] transition text-center"
              >
                🍕 Customer Login
              </button>
            </div>
          </div>

          {/* LOGIN FORM */}
          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                      loginErrors.email ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
                    }`}
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{loginErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                      loginErrors.password ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
                    }`}
                  />
                </div>
                {loginErrors.password && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{loginErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Mario Rossi"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                      registerErrors.name ? 'border-red-500' : 'border-stone-200'
                    }`}
                  />
                </div>
                {registerErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{registerErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="mario@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                      registerErrors.email ? 'border-red-500' : 'border-stone-200'
                    }`}
                  />
                </div>
                {registerErrors.email && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{registerErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password (min 6 characters)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50 ${
                      registerErrors.password ? 'border-red-500' : 'border-stone-200'
                    }`}
                  />
                </div>
                {registerErrors.password && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{registerErrors.password}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Street, City"
                    value={registerData.address}
                    onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
