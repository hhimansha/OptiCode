/**
 * Concept Extractor Controller
 * Student: IT22601360
 *
 * Proxies to Python AI service + saves results to MongoDB
 */

import axios from 'axios';
import ConceptExtraction from '../../models/IT22601360/ConceptExtraction.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const API_BASE = `${AI_SERVICE_URL}/api/IT22601360`;

const aiServiceClient = axios.create({
    baseURL: API_BASE,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' }
});


// ─── AI Service Proxy ─────────────────────────────────────────────────────────

export const healthCheck = async (req, res) => {
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

export const extractConcepts = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || code.trim() === '') {
            return res.status(400).json({ success: false, error: 'Code is required' });
        }

        const response = await aiServiceClient.post('/extract-enhanced', {
            code,
            language: language || 'python'
        });

        res.json(response.data);

    } catch (error) {
        console.error('Extract error:', error.message);
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                error: error.response.data?.detail || 'Extraction failed'
            });
        } else if (error.request) {
            res.status(503).json({
                success: false,
                error: 'AI service unavailable. Please ensure the Python service is running.'
            });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
};

export const quickClassify = async (req, res) => {
    try {
        const { code, language } = req.body;
        if (!code) return res.status(400).json({ success: false, error: 'Code is required' });

        const response = await aiServiceClient.post('/classify', {
            code,
            language: language || 'python'
        }, { timeout: 5000 });

        res.json(response.data);
    } catch {
        res.status(200).json({ detectedPatterns: {}, primaryCategory: null, confidence: 0, processingTimeMs: 0 });
    }
};

export const getConceptDetails = async (req, res) => {
    try {
        const { conceptName, codeContext, detailLevel } = req.body;
        if (!conceptName) return res.status(400).json({ success: false, error: 'Concept name is required' });

        const response = await aiServiceClient.post('/concept-details', {
            conceptName,
            codeContext: codeContext || '',
            detailLevel: detailLevel || 'intermediate'
        });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.detail || 'Failed to get concept details'
        });
    }
};

export const getVisualization = async (req, res) => {
    try {
        const { concepts, type } = req.body;
        if (!concepts || !Array.isArray(concepts)) {
            return res.status(400).json({ success: false, error: 'Concepts array is required' });
        }

        const response = await aiServiceClient.post('/visualize', {
            concepts,
            type: type || 'all'
        });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.detail || 'Failed to generate visualization'
        });
    }
};

export const getSupportedLanguages = async (req, res) => {
    try {
        const response = await aiServiceClient.get('/supported-languages');
        res.json(response.data);
    } catch {
        res.json({ languages: ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust'] });
    }
};

export const getModelInfo = async (req, res) => {
    try {
        const response = await aiServiceClient.get('/model-info');
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to get model info' });
    }
};


// ─── MongoDB History Controllers ──────────────────────────────────────────────

export const saveExtraction = async (req, res) => {
    try {
        const { sourceCode, language, concepts, metrics, processingTime, userId } = req.body;

        if (!sourceCode || !language) {
            return res.status(400).json({ success: false, message: 'sourceCode and language are required' });
        }
        if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one concept is required to save' });
        }

        const extraction = new ConceptExtraction({
            userId:         userId || null,
            sourceCode,
            language,
            concepts,
            metrics:        metrics        || {},
            processingTime: processingTime || 0
        });

        const saved = await extraction.save();

        return res.status(201).json({
            success: true,
            message: 'Extraction saved successfully',
            data: {
                id:           saved._id,
                title:        saved.title,
                tags:         saved.tags,
                conceptCount: saved.concepts.length,
                language:     saved.language,
                createdAt:    saved.createdAt
            }
        });

    } catch (err) {
        console.error('Save extraction error:', err);
        return res.status(500).json({ success: false, message: 'Failed to save extraction', error: err.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { limit = 20, page = 1, language, concept, userId } = req.query;

        const query = {};
        if (language) query.language = language.toLowerCase();
        if (userId)   query.userId   = userId;
        if (concept)  query.tags     = concept.toLowerCase().replace(/\s+/g, '-');

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [extractions, total] = await Promise.all([
            ConceptExtraction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-sourceCode'),
            ConceptExtraction.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: extractions,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
        });

    } catch (err) {
        console.error('Fetch extractions error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch extractions', error: err.message });
    }
};

export const getExtractionById = async (req, res) => {
    try {
        const extraction = await ConceptExtraction.findById(req.params.id);
        if (!extraction) return res.status(404).json({ success: false, message: 'Extraction not found' });

        return res.status(200).json({ success: true, data: extraction });
    } catch (err) {
        console.error('Fetch extraction error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch extraction', error: err.message });
    }
};

export const deleteExtraction = async (req, res) => {
    try {
        const deleted = await ConceptExtraction.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Extraction not found' });

        return res.status(200).json({ success: true, message: 'Extraction deleted successfully' });
    } catch (err) {
        console.error('Delete extraction error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete extraction', error: err.message });
    }
};

export const getHistoryStats = async (req, res) => {
    try {
        const [totalExtractions, topConcepts, languageDist] = await Promise.all([
            ConceptExtraction.countDocuments(),
            ConceptExtraction.aggregate([
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            ConceptExtraction.aggregate([
                { $group: { _id: '$language', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalExtractions,
                topConcepts:          topConcepts.map(t => ({ concept: t._id, count: t.count })),
                languageDistribution: languageDist.map(l => ({ language: l._id, count: l.count }))
            }
        });
    } catch (err) {
        console.error('Stats error:', err);
        return res.status(500).json({ success: false, message: 'Failed to get stats', error: err.message });
    }
};