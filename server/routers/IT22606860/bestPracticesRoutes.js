import express from 'express';
import {
    analyzeBestPractices,
    getPracticesBySession,
    markPracticeApplied,
    getBestPracticesStats
} from '../../controllers/IT22606860/bestPracticesController.js';

const router = express.Router();

// Analyze best practices for code
router.post('/analyze', analyzeBestPractices);

// Get practices by session ID
router.get('/session/:sessionId', getPracticesBySession);

// Mark a practice as applied
router.patch('/:practiceId/apply', markPracticeApplied);

// Get best practices statistics
router.get('/stats', getBestPracticesStats);

export default router;
