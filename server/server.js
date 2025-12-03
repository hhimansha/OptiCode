// server/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './Config/db.js';
import userRoutes from './routers/Userrouter.js';

import refactorRoutes from './routers/refactorRoutes.js';
import historyRoutes from './routers/historyRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

// ✅ Connect to MongoDB
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed frontend origins
const allowedOrigins = ['http://localhost:5173'];

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

// Existing user routes
app.use('/api/users', userRoutes);

// New routes added
app.use('/api/refactor', refactorRoutes);
app.use('/api/history', historyRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// =============================
//       START SERVER
// =============================
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
