import express from 'express';
import { refactorCode, getSuggestions } from '../controllers/refactorController.js';

const router = express.Router();

// POST /api/refactor - Refactor code
router.post('/', refactorCode);

// POST /api/refactor/suggestions - Get refactoring suggestions
router.post('/suggestions', getSuggestions);

export default router;
