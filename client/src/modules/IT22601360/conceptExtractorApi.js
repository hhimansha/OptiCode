/**
 * Code Concept Extractor - API Service
 * Student: IT22601360
 * 
 * Handles all API calls to the Python AI service
 */

import axios from 'axios';

// API Base URL - Update this based on your environment
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
const API_BASE = `${AI_SERVICE_URL}/api/IT22601360`;

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 120000, // 2 minutes for extraction
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

/**
 * Concept Extractor API
 */
export const conceptExtractorApi = {
    /**
     * Extract concepts from code
     * Main extraction endpoint using Gemini AI
     * 
     * @param {string} code - Source code to analyze
     * @param {string} language - Programming language
     * @returns {Promise} Extraction response with concepts and visualizations
     */
    extractConcepts: async (code, language = 'python') => {
        try {
            const response = await apiClient.post('/extract-enhanced', {
                code,
                language
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.detail || 
                'Failed to extract concepts. Please try again.'
            );
        }
    },

    /**
     * Quick classify code (rule-based, no LLM)
     * Fast endpoint for real-time feedback while typing
     * 
     * @param {string} code - Source code to classify
     * @param {string} language - Programming language
     * @returns {Promise} Quick classification result
     */
    quickClassify: async (code, language = 'python') => {
        try {
            const response = await apiClient.post('/classify', {
                code,
                language
            }, {
                timeout: 5000 // 5 second timeout for quick response
            });
            return response.data;
        } catch (error) {
            // Fail silently for quick classify
            console.warn('Quick classify failed:', error.message);
            return null;
        }
    },

    /**
     * Get detailed explanation of a concept
     * 
     * @param {string} conceptName - Name of the concept
     * @param {string} codeContext - Code where concept was found
     * @param {string} detailLevel - 'basic', 'intermediate', or 'advanced'
     * @returns {Promise} Detailed explanation
     */
    getConceptDetails: async (conceptName, codeContext = '', detailLevel = 'intermediate') => {
        try {
            const response = await apiClient.post('/concept-details', {
                conceptName,
                codeContext,
                detailLevel
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.detail || 
                'Failed to get concept details.'
            );
        }
    },

    /**
     * Generate specific visualization
     * 
     * @param {Array} concepts - List of extracted concepts
     * @param {string} type - 'graph', 'distribution', 'cards', 'mermaid', or 'all'
     * @returns {Promise} Visualization data
     */
    getVisualization: async (concepts, type = 'all') => {
        try {
            const response = await apiClient.post('/visualize', {
                concepts,
                type
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.detail || 
                'Failed to generate visualization.'
            );
        }
    },

    /**
     * Get supported programming languages
     * 
     * @returns {Promise} List of supported languages
     */
    getSupportedLanguages: async () => {
        try {
            const response = await apiClient.get('/supported-languages');
            return response.data;
        } catch (error) {
            // Return default list on error
            return {
                languages: ['python', 'javascript', 'typescript', 'java', 'cpp', 'c']
            };
        }
    },

    /**
     * Get AI model information
     * 
     * @returns {Promise} Model info for transparency
     */
    getModelInfo: async () => {
        try {
            const response = await apiClient.get('/model-info');
            return response.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * Health check
     * 
     * @returns {Promise} Health status
     */
    healthCheck: async () => {
        try {
            const response = await apiClient.get('/health');
            return response.data;
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
};

export default conceptExtractorApi;
