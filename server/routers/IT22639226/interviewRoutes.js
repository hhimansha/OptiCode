import express from 'express';
import userAuth from '../../middlewares/Userauth.js';// Your provided middleware
import { analyzeLatestInterview } from '../../controllers/IT22639226/Score.js'; // The controller function we just created

const router = express.Router();

// Route: GET /api/interviews/:interviewId/analyze
// Middleware 'userAuth' guarantees req.userId is securely populated
router.get('/analyze', userAuth, analyzeLatestInterview);

export default router;