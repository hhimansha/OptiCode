/**
 * Concept Extractor Controller
 * Student: IT22601360
 * 
 * Handles requests and proxies to Python AI service
 */

const axios = require('axios');

// Python AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const API_BASE = `${AI_SERVICE_URL}/api/IT22601360`;

// Create axios instance for AI service
const aiServiceClient = axios.create({
    baseURL: API_BASE,
    timeout: 120000, // 2 minutes for extraction
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Health Check
 */
exports.healthCheck = async (req, res) => {
    try {
        const response = await aiServiceClient.get('/health');
        res.json(response.data);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'AI service unavailable',
            details: error.message
        });
    }
};

/**
 * Extract Concepts from Code
 */
exports.extractConcepts = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || code.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Code is required'
            });
        }

        const response = await aiServiceClient.post('/extract', {
            code,
            language: language || 'python'
        });

        res.json(response.data);

    } catch (error) {
        console.error('Extract error:', error.message);
        
        if (error.response) {
            // AI service returned an error
            res.status(error.response.status).json({
                success: false,
                error: error.response.data?.detail || 'Extraction failed'
            });
        } else if (error.request) {
            // No response from AI service
            res.status(503).json({
                success: false,
                error: 'AI service unavailable. Please ensure the Python service is running.'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};

/**
 * Quick Classify (Rule-based only)
 */
exports.quickClassify = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Code is required'
            });
        }

        const response = await aiServiceClient.post('/classify', {
            code,
            language: language || 'python'
        }, {
            timeout: 5000 // 5 second timeout for quick response
        });

        res.json(response.data);

    } catch (error) {
        // Fail silently for quick classify
        res.status(200).json({
            detectedPatterns: {},
            primaryCategory: null,
            confidence: 0,
            processingTimeMs: 0
        });
    }
};

/**
 * Get Concept Details
 */
exports.getConceptDetails = async (req, res) => {
    try {
        const { conceptName, codeContext, detailLevel } = req.body;

        if (!conceptName) {
            return res.status(400).json({
                success: false,
                error: 'Concept name is required'
            });
        }

        const response = await aiServiceClient.post('/concept-details', {
            conceptName,
            codeContext: codeContext || '',
            detailLevel: detailLevel || 'intermediate'
        });

        res.json(response.data);

    } catch (error) {
        console.error('Concept details error:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.detail || 'Failed to get concept details'
        });
    }
};

/**
 * Get Visualization
 */
exports.getVisualization = async (req, res) => {
    try {
        const { concepts, type } = req.body;

        if (!concepts || !Array.isArray(concepts)) {
            return res.status(400).json({
                success: false,
                error: 'Concepts array is required'
            });
        }

        const response = await aiServiceClient.post('/visualize', {
            concepts,
            type: type || 'all'
        });

        res.json(response.data);

    } catch (error) {
        console.error('Visualization error:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.detail || 'Failed to generate visualization'
        });
    }
};

/**
 * Get Supported Languages
 */
exports.getSupportedLanguages = async (req, res) => {
    try {
        const response = await aiServiceClient.get('/supported-languages');
        res.json(response.data);
    } catch (error) {
        // Return default list on error
        res.json({
            languages: ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust']
        });
    }
};

/**
 * Get Model Info
 */
exports.getModelInfo = async (req, res) => {
    try {
        const response = await aiServiceClient.get('/model-info');
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Failed to get model info'
        });
    }
};
