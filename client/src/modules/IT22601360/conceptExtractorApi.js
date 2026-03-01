/**
 * Code Concept Extractor - API Service
 * Student: IT22601360
 *
 * AI calls  → Python service  (port 8000)
 * Save/History → Express/MongoDB (port 5000)
 */

import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
const MERN_API_URL   = import.meta.env.VITE_API_URL        || 'http://localhost:5000';

// ─── Axios clients ────────────────────────────────────────────────────────────

const aiClient = axios.create({
    baseURL: `${AI_SERVICE_URL}/api/IT22601360`,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' }
});

const mernClient = axios.create({
    baseURL: `${MERN_API_URL}/api/IT22601360`,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
});

// Logging interceptors
aiClient.interceptors.request.use(config => {
    console.log(`🚀 AI Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});
aiClient.interceptors.response.use(
    res   => { console.log(`✅ AI Response: ${res.status}`); return res; },
    error => { console.error('❌ AI Error:', error.response?.data || error.message); return Promise.reject(error); }
);

mernClient.interceptors.request.use(config => {
    console.log(`🚀 MERN Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});
mernClient.interceptors.response.use(
    res   => { console.log(`✅ MERN Response: ${res.status}`); return res; },
    error => { console.error('❌ MERN Error:', error.response?.data || error.message); return Promise.reject(error); }
);


// ─── AI Service API ───────────────────────────────────────────────────────────

export const conceptExtractorApi = {

    extractConcepts: async (code, language = 'python') => {
        try {
            const response = await aiClient.post('/extract-enhanced', { code, language });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to extract concepts. Please try again.');
        }
    },

    quickClassify: async (code, language = 'python') => {
        try {
            const response = await aiClient.post('/classify', { code, language }, { timeout: 5000 });
            return response.data;
        } catch (error) {
            console.warn('Quick classify failed:', error.message);
            return null;
        }
    },

    getConceptDetails: async (conceptName, codeContext = '', detailLevel = 'intermediate') => {
        try {
            const response = await aiClient.post('/concept-details', { conceptName, codeContext, detailLevel });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to get concept details.');
        }
    },

    getVisualization: async (concepts, type = 'all') => {
        try {
            const response = await aiClient.post('/visualize', { concepts, type });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to generate visualization.');
        }
    },

    getSupportedLanguages: async () => {
        try {
            const response = await aiClient.get('/supported-languages');
            return response.data;
        } catch {
            return { languages: ['python', 'javascript', 'typescript', 'java', 'cpp', 'c'] };
        }
    },

    getModelInfo: async () => {
        try {
            const response = await aiClient.get('/model-info');
            return response.data;
        } catch {
            return null;
        }
    },

    healthCheck: async () => {
        try {
            const response = await aiClient.get('/health');
            return response.data;
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
};


// ─── MongoDB History API (via Express on port 5000) ───────────────────────────

export const conceptHistoryApi = {

    /**
     * Save extraction result to MongoDB
     * Called automatically after every successful analysis
     */
    saveExtraction: async (extractionResult, sourceCode, language, userId = null) => {
        try {
            const payload = {
                sourceCode,
                language,
                concepts:       extractionResult.concepts       || [],
                metrics:        extractionResult.metrics        || {},
                processingTime: extractionResult.processingTime || 0,
                ...(userId && { userId })
            };
            const response = await mernClient.post('/history', payload);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to save extraction to database.');
        }
    },

    getHistory: async (options = {}) => {
        try {
            const { page = 1, limit = 20, language, concept, userId } = options;
            const params = { page, limit };
            if (language) params.language = language;
            if (concept)  params.concept  = concept;
            if (userId)   params.userId   = userId;
            const response = await mernClient.get('/history', { params });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch extraction history.');
        }
    },

    getExtractionById: async (id) => {
        try {
            const response = await mernClient.get(`/history/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch extraction.');
        }
    },

    deleteExtraction: async (id) => {
        try {
            const response = await mernClient.delete(`/history/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete extraction.');
        }
    },

    getStats: async () => {
        try {
            const response = await mernClient.get('/history/stats/summary');
            return response.data;
        } catch {
            return null;
        }
    }
};

export default conceptExtractorApi;