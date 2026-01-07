import express from 'express';
import {
    getHistory,
    getHistoryById,
    deleteHistory,
    clearAllHistory,
    getHistoryStats,
    getRecentHistory,
    searchHistory
} from '../../controllers/IT22606860/historyController.js';

const router = express.Router();

// Statistics and analytics
router.get('/stats', getHistoryStats);

// Recent history
router.get('/recent', getRecentHistory);

// Search history
router.get('/search', searchHistory);

// Clear all history (must be before /:id to avoid route conflict)
router.delete('/clear/all', clearAllHistory);
router.delete('/clear', clearAllHistory);

// GET /api/history - Get all history with pagination
router.get('/', getHistory);

// GET /api/history/:id - Get single history item
router.get('/:id', getHistoryById);

// DELETE /api/history/:id - Delete a history item
router.delete('/:id', deleteHistory);

export default router;