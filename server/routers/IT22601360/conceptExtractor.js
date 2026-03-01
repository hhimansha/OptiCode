/**
 * Concept Extractor Routes
 * Student: IT22601360
 */

import express from 'express';
import * as conceptExtractorController from '../../controllers/IT22601360/conceptExtractor.js';

const router = express.Router();

// ─── AI Service Proxy Routes ──────────────────────────────────────────────────
router.get('/health',                conceptExtractorController.healthCheck);
router.post('/extract-enhanced',     conceptExtractorController.extractConcepts);
router.post('/classify',             conceptExtractorController.quickClassify);
router.post('/concept-details',      conceptExtractorController.getConceptDetails);
router.post('/visualize',            conceptExtractorController.getVisualization);
router.get('/supported-languages',   conceptExtractorController.getSupportedLanguages);
router.get('/model-info',            conceptExtractorController.getModelInfo);

// ─── MongoDB History Routes ───────────────────────────────────────────────────
// NOTE: /history/stats/summary MUST be before /history/:id
router.get('/history/stats/summary', conceptExtractorController.getHistoryStats);
router.post('/history',              conceptExtractorController.saveExtraction);
router.get('/history',               conceptExtractorController.getHistory);
router.get('/history/:id',           conceptExtractorController.getExtractionById);
router.delete('/history/:id',        conceptExtractorController.deleteExtraction);

export default router;