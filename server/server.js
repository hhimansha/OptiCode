import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";


import { connectDB } from "./Config/db.js";
import Userrouter from "./routers/Userrouter.js";
import taskRoutes from "./routers/IT22604194/taskRoutes.js";
import livekitRouter from "./routers/livekitRouter.js";
// import AiInterviewRouter from "./routers/Ai_interviewrouter.js"; // Uncomment if needed and export matches

dotenv.config();

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

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
