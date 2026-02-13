import express from 'express';
import jwt from 'jsonwebtoken';
import { 
    refactorCode, 
    getSuggestions,
    multiModelRefactor,
    executeCode,
    analyzeMetrics,
    compareMetrics,
    generateTests,
    getExplanation,
    saveFeedback
} from '../../controllers/IT22606860/refactorController.js';
import { validateRequest } from '../../middelwares/IT22606860/validateRequest.js';

// Optional auth - attaches userId if token present, doesn't block if missing
const optionalAuth = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id) req.userId = decoded.id;
    } catch (e) { /* ignore invalid token */ }
    next();
};

const router = express.Router();

// Apply optional auth to all refactor routes
router.use(optionalAuth);

// Main refactoring endpoints
router.post('/', validateRequest(['code', 'instruction']), refactorCode);

router.post('/refactor', validateRequest(['code']), refactorCode);

router.post('/suggestions', getSuggestions);

// Multi-model refactoring
router.post('/multi-refactor', 
    validateRequest(['code']), 
    multiModelRefactor
);

// Code execution
router.post('/execute', 
    validateRequest(['code']), 
    executeCode
);

// Metrics endpoints
router.post('/analyze-metrics', 
    validateRequest(['code']), 
    analyzeMetrics
);

router.post('/compare-metrics', 
    validateRequest(['originalCode', 'refactoredCode']), 
    compareMetrics
);

// Testing endpoints
router.post('/generate-tests', 
    validateRequest(['code']), 
    generateTests
);

// Explanation endpoint
router.post('/explain', 
    validateRequest(['originalCode', 'refactoredCode']), 
    getExplanation
);

// Feedback endpoint
router.post('/feedback', 
    validateRequest(['historyId']), 
    saveFeedback
);

export default router;