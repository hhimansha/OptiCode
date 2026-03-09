import express from 'express';
import {
    getDashboard,
    getQualityTrends,
    getModelComparison,
    getTopRefactorings,
    exportAnalytics
} from '../../controllers/IT22606860/analyticsController.js';

const router = express.Router();

// Get overall analytics dashboard
router.get('/dashboard', getDashboard);

// Get quality trends over time
router.get('/trends', getQualityTrends);

// Get model comparison analytics
router.get('/model-comparison', getModelComparison);

// Get top refactorings
router.get('/top', getTopRefactorings);

// Export analytics data
router.get('/export', exportAnalytics);

export default router;
