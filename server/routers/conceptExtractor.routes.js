/**
 * Concept Extractor Routes
 * Student: IT22601360
 * 
 * Express routes that proxy requests to Python AI service
 */

const express = require('express');
const router = express.Router();
const conceptExtractorController = require('../controllers/conceptExtractor.controller');

// Health check
router.get('/health', conceptExtractorController.healthCheck);

// Main extraction endpoint
router.post('/extract', conceptExtractorController.extractConcepts);

// Quick classification (no LLM)
router.post('/classify', conceptExtractorController.quickClassify);

// Get concept details
router.post('/concept-details', conceptExtractorController.getConceptDetails);

// Get visualization
router.post('/visualize', conceptExtractorController.getVisualization);

// Get supported languages
router.get('/supported-languages', conceptExtractorController.getSupportedLanguages);

// Get model info
router.get('/model-info', conceptExtractorController.getModelInfo);

module.exports = router;
