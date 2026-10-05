import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, DollarSign, ShoppingBag, Clock, CheckCircle2, Plus, RefreshCw, ChefHat, Filter, Lock, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPanelModal = ({ isOpen, onClose }) => {
  const { user, isAdmin, login, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'analytics', 'addPizza'
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // New Pizza Form State
  const [newPizza, setNewPizza] = useState({
    name: '',
    category_id: 1,
    base_price: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    prep_time: '15-20 mins',
    calories: 780,
    is_veg: false,
    is_spicy: false,
    is_bestseller: false,
  });
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const [ordersRes, analyticsRes] = await Promise.all([
        api.getAdminOrders(statusFilter),
        api.getAdminAnalytics(),
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.data);
      }
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadData();
    }
  }, [isOpen, statusFilter, isAdmin]);

  if (!isOpen) return null;

  const handleQuickAdminUnlock = async () => {
    try {
      setLoading(true);
      await login({ email: 'admin@bellacrust.com', password: 'AdminPassword123!' });
    } catch (err) {
      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreatePizza = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    if (!newPizza.name || !newPizza.base_price || !newPizza.description) {
      setFormMsg({ type: 'error', text: 'Name, price, and description are required.' });
      return;
    }

    try {
      const res = await api.addPizza({
        ...newPizza,
        base_price: parseFloat(newPizza.base_price),
      });

      if (res.success) {
        setFormMsg({ type: 'success', text: `Pizza "${newPizza.name}" successfully added to the PostgreSQL menu!` });
        setNewPizza({
          name: '',
          category_id: 1,
          base_price: '',
          description: '',
          image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
          prep_time: '15-20 mins',
          calories: 780,
          is_veg: false,
          is_spicy: false,
          is_bestseller: false,
        });
      }
    } catch (err) {
      setFormMsg({ type: 'error', text: 'Failed to add pizza' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-serif">Kitchen & Store Console</h2>
                <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
                  PostgreSQL 18
                </span>
              </div>
              <p className="text-xs text-stone-400">Live order queue, real-time status management & analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-stone-200 bg-stone-50 flex gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Live Kitchen Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Store Metrics & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('addPizza')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'addPizza'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Pizza Item</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAdmin ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black font-serif text-stone-900">Admin Authorization Required</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                This console is protected by Jose JWT & Role-Based Access Control (RBAC). Please authenticate with administrator privileges to manage tickets and view financial metrics.
              </p>
              <div className="pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleQuickAdminUnlock}
                  className="w-full py-3 bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>One-Click Sign In as Store Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition py-1"
                >
                  Or enter custom credentials
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: Live Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
              
              {/* Filter Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter by Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-1.5 rounded-lg border border-stone-200 bg-white font-normal"
                  >
                    <option value="all">All Orders</option>
                    <option value="received">Received</option>
                    <option value="preparing">Preparing</option>
                    <option value="baking">Baking</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="text-xs text-stone-500">
                  Showing <strong>{orders.length}</strong> tickets
                </div>
              </div>

              {/* Orders Table */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-3.5">Order Ref</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Total & Payment</th>
                        <th className="p-3.5">Placed At</th>
                        <th className="p-3.5">Kitchen Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-stone-400">
                            No orders matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-50/60 transition">
                            <td className="p-3.5 font-bold font-mono text-stone-900">
                              {ord.order_number}
                              <div className="text-[10px] text-stone-400 uppercase font-sans">
                                {ord.order_type}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-bold text-stone-900">{ord.customer_name}</div>
                              <div className="text-stone-500 text-[11px]">{ord.customer_phone}</div>
                              <div className="text-stone-400 text-[10px] truncate max-w-[150px]">{ord.delivery_address}</div>
                            </td>

                            <td className="p-3.5">
                              <div className="space-y-1">
                                {ord.items?.map((it, i) => (
                                  <div key={i} className="text-stone-800 text-[11px]">
                                    <span className="font-bold text-orange-600">{it.quantity}x</span> {it.pizza_name} ({it.size_name})
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-bold font-mono text-stone-900">
                                ${parseFloat(ord.total_amount).toFixed(2)}
                              </div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                ord.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {ord.payment_method} ({ord.payment_status})
                              </span>
                            </td>

                            <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                              {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>

                            {/* Status Changer Select */}
                            <td className="p-3.5">
                              <select
                                value={ord.order_status}
                                disabled={updatingId === ord.id}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                                  ord.order_status === 'delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : ord.order_status === 'out_for_delivery'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : ord.order_status === 'baking'
                                    ? 'bg-orange-50 text-orange-700 border-orange-300'
                                    : ord.order_status === 'preparing'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                                    : 'bg-stone-100 text-stone-700 border-stone-300'
                                }`}
                              >
                                <option value="received">Received</option>
                                <option value="preparing">Preparing</option>
                                <option value="baking">Baking</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Analytics */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Sales</div>
                  <div className="text-2xl font-black text-stone-900 font-mono mt-1">
                    ${parseFloat(analytics.stats?.total_revenue || 0).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">From PostgreSQL orders</div>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Orders</div>
                  <div className="text-2xl font-black text-stone-900 font-mono mt-1">
                    {analytics.stats?.total_orders || 0}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium mt-1">Lifetime customer tickets</div>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Active Kitchen Orders</div>
                  <div className="text-2xl font-black text-orange-600 font-mono mt-1">
                    {analytics.stats?.active_orders || 0}
                  </div>
                  <div className="text-[11px] text-orange-600 font-semibold mt-1">Currently prepping / baking</div>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Delivered Orders</div>
                  <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
                    {analytics.stats?.delivered_orders || 0}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">Successfully fulfilled</div>
                </div>
              </div>

              {/* Top Selling Pizzas */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-bold text-sm text-stone-900 mb-4">Top-Selling Pizzas</h3>
                <div className="space-y-3">
                  {analytics.top_pizzas?.map((tp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-stone-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-stone-900">{tp.pizza_name}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-stone-500">{tp.total_sold} units sold</span>
                        <span className="font-mono font-bold text-stone-900">${parseFloat(tp.total_revenue).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Add New Pizza Item */}
          {activeTab === 'addPizza' && (
            <form onSubmit={handleCreatePizza} className="max-w-xl mx-auto space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                Create New Pizza Menu Item
              </h3>

              {formMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {formMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Pizza Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smoky Chipotle Bacon Supreme"
                  value={newPizza.name}
                  onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="17.99"
                    value={newPizza.base_price}
                    onChange={(e) => setNewPizza({ ...newPizza, base_price: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newPizza.category_id}
                    onChange={(e) => setNewPizza({ ...newPizza, category_id: parseInt(e.target.value, 10) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={1}>Timeless Classics</option>
                    <option value={2}>Chef's Signature</option>
                    <option value={3}>Meat Feast</option>
                    <option value={4}>Veggie Paradise</option>
                    <option value={5}>Fiery & Spicy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Delicious ingredients and flavor notes..."
                  value={newPizza.description}
                  onChange={(e) => setNewPizza({ ...newPizza, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newPizza.image_url}
                  onChange={(e) => setNewPizza({ ...newPizza, image_url: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-600"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPizza.is_veg}
                    onChange={(e) => setNewPizza({ ...newPizza, is_veg: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPizza.is_spicy}
                    onChange={(e) => setNewPizza({ ...newPizza, is_spicy: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Spicy</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPizza.is_bestseller}
                    onChange={(e) => setNewPizza({ ...newPizza, is_bestseller: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Best Seller Flag</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Save Pizza to PostgreSQL Database
              </button>
            </form>
          )}
          </>
        )}

        </div>

      </div>
    </div>
  );
};
