# 🍕 Bella Crust Pizza - Full-Stack Ordering Website

A complete, production-ready artisanal pizza ordering application built with **React**, **Tailwind CSS**, **Node.js (Express)**, and **PostgreSQL 18**, equipped with **Jose JWT Authentication**, **Role-Based Access Control (RBAC)**, **Yup Schema Validation**, and **React Context State Management**.

---

## 🌟 Features Overview

### 🔐 Authentication & Authorization (Jose + Yup + RBAC)
- **Token-based Authentication**: High-security JWT tokens signed & verified with **`jose`** (`HS256`).
- **Role-Based Authorization (RBAC)**: Distinguishes between `customer` and `admin` roles.
  - **Admin Access**: Protected kitchen console, revenue analytics, order status updates, and menu management.
  - **Customer Access**: Order placement, order history, profile auto-fill.
- **Yup Schema Validation**:
  - **Backend**: Strict validation middleware checking registration, login, and order payloads before database operations.
  - **Frontend**: Real-time form feedback and validation error highlights under form inputs.
- **Pre-configured Demo Accounts**:
  - **Admin**: `admin@bellacrust.com` / `AdminPassword123!`
  - **Customer**: `alex.wright@example.com` / `CustomerPassword123!`

### 🧠 State Management (React Context)
- **`AuthContext`**: Manages current user session, Jose JWT token persistence (`localStorage`), login, registration, logout, role check (`isAdmin`), and auth modal triggers.
- **`CartContext`**: Manages cart items with multi-variant pizza configurations, quantity increments, promo code applications (`PIZZA20`, `SAVE5`, `FREESHIP`), delivery fee computations, and active order tracking.

### 🎨 Frontend (React + Tailwind CSS)
- **Appetizing Modern UI**: Stone-baked artisanal branding, responsive layouts, smooth animations, and high-resolution visuals.
- **Dynamic Pizza Customizer Modal**:
  - Choose Sizes: *Personal (8")*, *Medium (10")*, *Large (12")*, *Monster XL (16")* with live price scaling.
  - Choose Crust: *Classic Stone-Baked*, *Thin & Crispy Roman*, *Double Cheese Burst*, *Garlic Herb Stuffed Crust*, *Gluten-Friendly Cauliflower*.
  - Extra Toppings: Cheeses, Meats, Veggies, Sauces with multi-select checkboxes.
  - Special Kitchen Instructions note.
  - Real-time price recalculation based on size multiplier, crust additions, and toppings.
- **Cart & Slide-Over Drawer**:
  - Custom pizza items with distinct configurations, quantities, notes.
  - Free delivery progress meter ($35+ free threshold).
  - Promo code discounts system (`PIZZA20` for 20% off, `SAVE5` for $5 off, `FREESHIP` for free delivery).
  - Tax and subtotal breakdown.
- **Seamless Checkout Modal**:
  - Auto-fills customer profile when logged in.
  - Validated by Yup schemas.
  - Toggle between Delivery and Store Pick-up.
  - Payment method choices (Cash on Delivery, Credit/Debit Card, Apple Pay).
  - Direct submission into PostgreSQL database with celebratory confetti.
- **Live Pizza Tracker**:
  - Track any order by reference number (e.g. `ORD-98214`).
  - Animated 5-stage kitchen & delivery tracker.
- **Kitchen / Store Admin Panel**:
  - Protected by Jose JWT and `requireAdmin` middleware.
  - Real-time store analytics: Total sales revenue, total orders, active kitchen tickets.
  - Live orders management table with **instant status dropdown changer** (`received` -> `preparing` -> `baking` -> `out_for_delivery` -> `delivered`).
  - Form to add new pizza items directly to PostgreSQL.
- **Customer Reviews & Testimonials**:
  - Star rating reviews stored and fetched from PostgreSQL.
  - Interactive "Leave a Review" modal form.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite 8, Tailwind CSS, Yup, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, `jose` (JWT), `bcryptjs`, `yup`, `pg` (PostgreSQL Client Pool), CORS, Morgan.
- **Database**: PostgreSQL 18 (Database: `pizza_db`).

---

## 🗄️ PostgreSQL Database Schema

- `users` (id, name, email, password_hash, phone, address, role, created_at)
- `categories` (slug, name, icon, display_order)
- `pizzas` (name, slug, description, image_url, base_price, rating, reviews_count, prep_time, calories, is_veg, is_spicy, is_bestseller, ingredients)
- `sizes` (name, code, price_multiplier, slices, serves)
- `crusts` (name, code, description, extra_price)
- `toppings` (name, category, price, is_veg)
- `orders` (order_number, user_id, customer_name, customer_email, customer_phone, order_type, delivery_address, subtotal, discount, delivery_fee, tax, total_amount, payment_method, order_status, estimated_delivery_time)
- `order_items` (order_id, pizza_id, pizza_name, size_name, crust_name, toppings JSONB, special_notes, quantity, unit_price, total_price)
- `customer_reviews` (customer_name, rating, comment, pizza_name, avatar_url)

---

## 🚀 Running the Project

### Start Both Frontend and Backend Concurrently
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### Quick Demo Credentials:
- **Admin**: `admin@bellacrust.com` / `AdminPassword123!`
- **Customer**: `alex.wright@example.com` / `CustomerPassword123!`
