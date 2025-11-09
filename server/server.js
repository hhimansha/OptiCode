import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // if using Node <18, install: npm install node-fetch
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('OptiCode Server is running');
});

// Endpoint to forward quiz answers to the Python ML API
app.post('/api/predict-skill', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error connecting to Python model:', error);
    res.status(500).json({ error: 'Failed to connect to skill model' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
