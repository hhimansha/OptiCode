import express from 'express';
import { getDashboard, getQualityTrends, getModelComparison, getTopRefactorings, exportAnalytics } from '../../controllers/IT22606860/analyticsController.js';

const router = express.Router();

// Analytics endpoints
router.get('/dashboard', 
    getDashboard
);

router.get('/quality-trends', 
    getQualityTrends
);

router.get('/model-comparison', 
    getModelComparison
);

router.get('/top-refactorings', 
    getTopRefactorings
);

router.get('/export', 
    exportAnalytics
);

export default router;