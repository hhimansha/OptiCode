// server/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './Config/db.js';
import userRoutes from './routers/IT22606860/Userrouter.js';

// IT22606860 Routes
import refactorRoutes from './routers/IT22606860/refactorRoutes.js';
import historyRoutes from './routers/IT22606860/historyRoutes.js';
import riskRoutes from './routers/IT22606860/riskRoutes.js';
import bestPracticesRoutes from './routers/IT22606860/bestPracticesRoutes.js';
import analyticsRoutes from './routers/IT22606860/analyticsRoutes.js';

import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

// ✅ Connect to MongoDB
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed frontend origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

// ✅ Middleware
app.use(express.json({ limit: '50mb' }));  
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// =============================
//          ROUTES
// =============================
app.get('/', (req, res) => {
  res.send('OptiCode Server is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Existing user routes
app.use('/api/users', userRoutes);

// IT22606860 Routes - Primary endpoints
app.use('/api/refactor', refactorRoutes);
app.use('/api/history', historyRoutes);

// IT22606860 Routes - Additional feature endpoints
app.use('/api/IT22606860/refactor', refactorRoutes);
app.use('/api/IT22606860/history', historyRoutes);
app.use('/api/IT22606860/risks', riskRoutes);
app.use('/api/IT22606860/best-practices', bestPracticesRoutes);
app.use('/api/IT22606860/analytics', analyticsRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// =============================
//       START SERVER
// =============================
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  console.log(`🤖 ML Service: ${process.env.ML_API_URL || 'http://localhost:8000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});