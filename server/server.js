import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import dotenv from "dotenv";
import Userrouter from './routes/Userrouter.js';

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
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

  
  // ADD DEBUG ROUTE FIRST
app.get('/api/debug', (req, res) => {
  console.log('🟡 Debug route hit');
  res.json({ message: 'Debug route works!' });
});

console.log('🟡 Registering user routes...');
// ADD THIS LINE - Register user routes
app.use('/api/users', Userrouter);

app.get('/', (req, res) => {
  res.send('OptiCode Server is running');
});

// Endpoint to forward quiz answers to the Python ML API
// Endpoint to forward quiz answers to the Python ML API
app.post('/api/predict-skill', async (req, res) => {
  try {
    console.log('📡 Received quiz request at /api/predict-skill');
    console.log('Request body:', req.body);
    
    const flaskResponse = await fetch('http://127.0.0.1:8001/api/predict-skill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    console.log('Flask response status:', flaskResponse.status);
    
    if (!flaskResponse.ok) {
      throw new Error(`Flask API returned ${flaskResponse.status}: ${flaskResponse.statusText}`);
    }
    
    const result = await flaskResponse.json();
    console.log('✅ Prediction successful:', result.skill_level);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/predict-skill:', error);
    res.status(500).json({ 
      error: 'Failed to connect to skill model',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});