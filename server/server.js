import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import dotenv from "dotenv";
import Userrouter from './routers/Userrouter.js';
import taskRoutes from "./routers/IT22604194/taskRoutes.js";


// 🔥 Keep HF Space awake (prevents cold start)
setInterval(() => {
  fetch("https://ashani-shashikala-qwen-lora-task-generator.hf.space/")
    .catch(() => {});
}, 5 * 60 * 1000); // every 5 minutes



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🟡 Server starting...');

// Fix CORS to allow credentials
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
// MIDDLEWARES IN ORDER
app.use(express.json());
app.use(cookieParser()); 


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.log(" Mongo Error:", err));

  
  // ADD DEBUG ROUTE FIRST
app.get('/api/debug', (req, res) => {
  console.log(' Debug route hit');
  res.json({ message: 'Debug route works!' });
});

console.log(' Registering user routes...');
// ADD THIS LINE - Register user routes
app.use('/api/users', Userrouter);
app.use("/api/tasks", taskRoutes);


app.get('/', (req, res) => {
  res.send('OptiCode Server is running');
});

// Endpoint to forward quiz answers to the Python ML API
// Endpoint to forward quiz answers to the Python ML API
app.post('/api/predict-skill', async (req, res) => {
  try {
    console.log(' Received quiz request at /api/predict-skill');
    console.log('Request body:', req.body);
    
    const flaskResponse = await fetch(`${process.env.SKILL_MODEL_URL}/api/predict-skill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    console.log('Flask response status:', flaskResponse.status);
    
    if (!flaskResponse.ok) {
      throw new Error(`Flask API returned ${flaskResponse.status}: ${flaskResponse.statusText}`);
    }
    
    const result = await flaskResponse.json();
    console.log(' Prediction successful:', result.skill_level);
    res.json(result);
  } catch (error) {
    console.error(' Error in /api/predict-skill:', error);
    res.status(500).json({ 
      error: 'Failed to connect to skill model',
      details: error.message 
    });
  }
});

//TASK GENERATOR (FastAPI 8000)



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});