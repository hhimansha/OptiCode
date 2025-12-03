import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './Config/db.js';
import userRoutes from './routers/Userrouter.js';

dotenv.config();

await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed origins (frontend URLs)
const allowedOrigins = ['http://localhost:5173']; 

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ Routes
app.get('/', (req, res) => {
  res.send('OptiCode Server is running');
});

app.use('/api/users', userRoutes);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
