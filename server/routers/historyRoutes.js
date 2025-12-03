import express from 'express';
import {
    getHistory,
    getHistoryById,
    deleteHistory,
    clearAllHistory
} from '../controllers/historyController.js';

const router = express.Router();

// GET /api/history - Get all history with pagination
router.get('/', getHistory);

// GET /api/history/:id - Get single history item
router.get('/:id', getHistoryById);

// DELETE /api/history/:id - Delete a history item
router.delete('/:id', deleteHistory);

// DELETE /api/history/clear - Clear all history
router.delete('/clear', clearAllHistory);

export default router;
