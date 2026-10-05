import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import pizzasRouter from './routes/pizzas.js';
import optionsRouter from './routes/options.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
import reviewsRouter from './routes/reviews.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Allow frontend development server
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/pizzas', pizzasRouter);
app.use('/api/options', optionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Pizza Ordering API',
    database: 'PostgreSQL 18 connected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('🍕 Welcome to the Artisanal Pizza Order API! Visit /api/health or /api/pizzas.');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`🍕 Pizza API Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use by another running process.`);
    console.error(`👉 Solution: Terminate the old process occupying port ${PORT} or change PORT in backend/.env.\n`);
    process.exit(1);
  } else {
    console.error('Server startup error:', err);
  }
});

