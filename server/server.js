import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

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
app.post("/api/predict-skill", (req, res) => {
    console.log("Mock predict-skill called");
    res.json({
        skill_level: "Intermediate",
        confidence: 0.85,
        category_scores: { "Syntax": 80, "Logic": 90 },
        probabilities: { "Beginner": 0.1, "Intermediate": 0.8, "Advanced": 0.1 },
        research_analysis: {
            research_recommendations: ["Study recursion", "Practice DP"]
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
