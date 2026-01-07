import express from 'express';
import { analyzeBestPractices, getPracticesBySession, markPracticeApplied, getBestPracticesStats } from '../../controllers/IT22606860/bestPracticesController.js';
import { validateRequest } from '../../middelwares/IT22606860/validateRequest.js';

const router = express.Router();

// Best practices endpoints
router.post('/analyze', 
    validateRequest(['code']), 
    analyzeBestPractices
);

router.get('/session/:sessionId', 
    getPracticesBySession
);

router.patch('/:practiceId/apply', 
    markPracticeApplied
);

router.get('/stats', 
    getBestPracticesStats
);

export default router;