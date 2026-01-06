
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

app.use('/api/livekit', livekitRouter);
app.use('/api/question', Questionrouter);
// ✅ Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
