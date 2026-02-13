
import fetch from "node-fetch";

import Userrouter from "./routers/Userrouter.js";
import taskRoutes from "./routers/IT22604194/taskRoutes.js";
import livekitRouter from "./routers/livekitRouter.js";
// import AiInterviewRouter from "./routers/Ai_interviewrouter.js"; // Uncomment if needed and export matches
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './Config/db.js';
//import userRoutes from './routers/IT22606860/Userrouter.js';

// IT22606860 Routes
import refactorRoutes from './routers/IT22606860/refactorRoutes.js';
import historyRoutes from './routers/IT22606860/historyRoutes.js';
import riskRoutes from './routers/IT22606860/riskRoutes.js';
import bestPracticesRoutes from './routers/IT22606860/bestPracticesRoutes.js';
import analyticsRoutes from './routers/IT22606860/analyticsRoutes.js';
import dashboardRoutes from './routers/IT22606860/dashboardRoutes.js';

import errorHandler from './middlewares/errorHandler.js';
import userRoutes from './routers/Userrouter.js';
import Ai_interviewrouter from "./routers/Ai_interviewrouter.js";
import Questionrouter from './routers/IT22639226/Questionrouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
    console.warn('⚠️ .env file not found, using system environment variables');
} else {
    console.log('✅ .env file loaded successfully');
}

// Debug: Log LiveKit config status
console.log('🔍 LiveKit Config Check:');
console.log('LIVEKIT_URL:', process.env.LIVEKIT_URL ? '✅ Set' : '❌ Missing');
console.log('LIVEKIT_API_KEY:', process.env.LIVEKIT_API_KEY ? '✅ Set' : '❌ Missing');
console.log('LIVEKIT_API_SECRET:', process.env.LIVEKIT_API_SECRET ? '✅ Set' : '❌ Missing');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow frontend
    credentials: true
}));

// Routes
app.use("/api/users", Userrouter);
app.use("/api/tasks", taskRoutes);
app.use("/api/livekit", livekitRouter);

// Mock route for predict-skill (Missing in conflict resolution)
app.post("/api/predict-skill", async (req, res) => {
    try {
        console.log("Proxying skill prediction to Flask...");
        
        const response = await fetch("http://127.0.0.1:8001/api/predict-skill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Skill model proxy error:", err);
        res.status(500).json({ error: "Skill model unavailable" });
    }
});


const PORT = process.env.PORT || 5000;

// IT22606860 Routes - Additional feature endpoints
app.use('/api/IT22606860/refactor', refactorRoutes);
app.use('/api/IT22606860/history', historyRoutes);
app.use('/api/IT22606860/risks', riskRoutes);
app.use('/api/IT22606860/best-practices', bestPracticesRoutes);
app.use('/api/IT22606860/analytics', analyticsRoutes);
app.use('/api/IT22606860/dashboard', dashboardRoutes);

// LiveKit and Question routes
app.use('/api/livekit', livekitRouter);
app.use('/api/question', Questionrouter);

// 404 handler for undefined routes (must be after all other routes)
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
// ✅ Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
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