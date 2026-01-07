import express from 'express';
import { analyzeRisks, compareRisks, getRisksBySession, markRiskFixed, getRiskStats } from '../../controllers/IT22606860/riskController.js';
import { validateRequest } from '../../middelwares/IT22606860/validateRequest.js';

const router = express.Router();

// Risk analysis endpoints
router.post('/analyze', 
    validateRequest(['code']), 
    analyzeRisks
);

router.post('/compare', 
    validateRequest(['originalCode', 'refactoredCode']), 
    compareRisks
);

router.get('/session/:sessionId', 
    getRisksBySession
);

router.patch('/:riskId/fix', 
    markRiskFixed
);

router.get('/stats', 
    getRiskStats
);

export default router;