import express from 'express';
import { getLatestSession } from '../../controllers/IT22639226/StudentProgressController.js';
import userAuth from '../../middlewares/Userauth.js';

const router = express.Router();

// This matches the fetch URL: http://localhost:5000/api/student-progress/latest
router.get('/latest', userAuth, getLatestSession);

export default router;