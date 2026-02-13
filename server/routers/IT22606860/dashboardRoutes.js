import express from 'express';
import userAuth from '../../middelwares/Userauth.js';
import {
    getDashboardOverview,
    getEvolutionTimeline,
    getSessionComparison,
    getPerformanceAnalytics,
    getRiskSecurityAnalytics,
    getBestPracticeCompliance,
    getTechnicalDebtTracker,
    getDeveloperGrowth
} from '../../controllers/IT22606860/dashboardController.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(userAuth);

// A. Overview Panel
router.get('/overview', getDashboardOverview);

// B. Code Evolution Timeline
router.get('/timeline', getEvolutionTimeline);

// C. Session Comparison
router.get('/comparison/:sessionId', getSessionComparison);

// D. Performance Analytics
router.get('/performance', getPerformanceAnalytics);

// E. Risk & Security Analysis
router.get('/risk-security', getRiskSecurityAnalytics);

// F. Best Practice Compliance
router.get('/best-practices', getBestPracticeCompliance);

// G. Technical Debt Tracker
router.get('/technical-debt', getTechnicalDebtTracker);

// Developer Growth Score + Smart Recommendations
router.get('/growth', getDeveloperGrowth);

export default router;
