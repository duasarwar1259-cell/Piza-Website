const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('bella_auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication & Authorization (Jose JWT + Yup)
  async login(credentials) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors.map(e => e.message).join(', '));
      }
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data;
  },

  async getMyOrders() {
    const res = await fetch(`${BASE_URL}/auth/my-orders`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch your orders');
    return data;
  },

  // Pizzas
  async getPizzas(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.veg) query.append('veg', 'true');
    if (params.spicy) query.append('spicy', 'true');
    if (params.bestseller) query.append('bestseller', 'true');
    if (params.sort) query.append('sort', params.sort);

    const res = await fetch(`${BASE_URL}/pizzas?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch pizzas');
    return res.json();
  },

  async getPizzaById(id) {
    const res = await fetch(`${BASE_URL}/pizzas/${id}`);
    if (!res.ok) throw new Error('Failed to fetch pizza details');
    return res.json();
  },

  // Customization Options
  async getOptions() {
    const res = await fetch(`${BASE_URL}/options`);
    if (!res.ok) throw new Error('Failed to fetch customization options');
    return res.json();
  },

  // Orders
  async createOrder(orderPayload) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors.map(e => e.message).join(', '));
      }
      throw new Error(data.message || 'Failed to place order');
    }
    return data;
  },

  async trackOrder(orderNumber) {
    const res = await fetch(`${BASE_URL}/orders/${orderNumber}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order not found');
    return data;
  },

  // Admin (Authorized by Jose JWT + Admin role)
  async getAdminOrders(status = 'all') {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/admin/orders${query}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin orders');
    return data;
  },

  async updateOrderStatus(orderId, status, paymentStatus) {
    const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, payment_status: paymentStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  async getAdminAnalytics() {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load store analytics');
    return data;
  },

  async addPizza(pizzaData) {
    const res = await fetch(`${BASE_URL}/pizzas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pizzaData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create pizza');
    return data;
  },

  async togglePizzaAvailability(id, is_available) {
    const res = await fetch(`${BASE_URL}/admin/pizzas/${id}/availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_available }),
    });
    if (!res.ok) throw new Error('Failed to update availability');
    return res.json();
  },

  // Reviews
  async getReviews() {
    const res = await fetch(`${BASE_URL}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch customer reviews');
    return res.json();
  },

  async addReview(reviewData) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit review');
    return data;
  },
};
