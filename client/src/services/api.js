// ============================================
// OPTICODE/client/src/services/api.js
// Combined API service - Express Backend + Python ML Service
// Complete API service for all features
// ============================================

import axios from 'axios';

// API URLs
const EXPRESS_API_URL = 'http://localhost:5000/api';  // Primary Express backend
const EXPRESS_API_IT22606860 = 'http://localhost:5000/api/IT22606860';  // IT22606860 routes
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';  // Python ML

// Create axios instance for primary Express backend
const expressApi = axios.create({
    baseURL: EXPRESS_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Create axios instance for IT22606860 Express routes
const expressApiIT = axios.create({
    baseURL: EXPRESS_API_IT22606860,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Create axios instance for ML service
const mlApi = axios.create({
    baseURL: ML_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// ============================================
// REFACTORING ENDPOINTS
// ============================================

/**
 * Refactor code using trained model (Primary endpoint)
 * @param {string} code - Code to refactor
 * @param {string} instruction - Refactoring instruction
 * @param {string} language - Programming language
 * @returns {Promise} Response with refactored code
 */
export const refactorCode = async (code, instruction, language) => {
    try {
        const response = await expressApi.post('/refactor', {
            code: code,
            instruction: instruction || 'Refactor this code',
            language: language || 'javascript'
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to refactor code');
        } else if (error.request) {
            throw new Error('Cannot connect to refactoring service. Make sure the API is running on ' + EXPRESS_API_URL);
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};

/**
 * Multi-model refactoring comparison
 * @param {string} code - Code to refactor
 * @param {string} instruction - Refactoring instruction
 * @param {string} language - Programming language
 * @returns {Promise} Response with multiple model results
 */
export const multiModelRefactor = async (code, instruction, language) => {
    try {
        const response = await expressApi.post('/refactor/multi-refactor', {
            code,
            instruction: instruction || 'Refactor this code',
            language: language || 'javascript'
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Execute code and get output
 * @param {string} code - Code to execute
 * @returns {Promise} Response with execution output/error
 */
export const executeCode = async (code) => {
    try {
        const response = await expressApi.post('/refactor/execute', {
            code: code
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to execute code');
        } else if (error.request) {
            throw new Error('Cannot connect to execution service. Make sure the API is running on ' + EXPRESS_API_URL);
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};

/**
 * Get refactoring suggestions
 * @param {string} code - Code to analyze
 * @param {string} language - Programming language
 * @returns {Promise} Response with suggestions
 */
export const getSuggestions = async (code, language = 'javascript') => {
    try {
        const response = await expressApi.post('/refactor/suggestions', {
            code,
            language
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// RISK ANALYSIS ENDPOINTS
// ============================================

/**
 * Analyze code for security and quality risks
 * @param {string} code - Code to analyze
 * @param {string} sessionId - Optional session ID
 * @returns {Promise} Response with risk analysis
 */
export const analyzeRisks = async (code, sessionId = null) => {
    try {
        const response = await expressApiIT.post('/risks/analyze', {
            code,
            sessionId
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Compare risks before and after refactoring
 * @param {string} originalCode - Original code
 * @param {string} refactoredCode - Refactored code
 * @param {string} historyId - Optional history ID
 * @returns {Promise} Response with risk comparison
 */
export const compareRisks = async (originalCode, refactoredCode, historyId = null) => {
    try {
        const response = await expressApiIT.post('/risks/compare', {
            originalCode,
            refactoredCode,
            historyId
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get risks by session ID
 * @param {string} sessionId - Session ID
 * @returns {Promise} Response with risks
 */
export const getRisksBySession = async (sessionId) => {
    try {
        const response = await expressApiIT.get(`/risks/session/${sessionId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Mark risk as fixed
 * @param {string} riskId - Risk ID
 * @returns {Promise} Response
 */
export const markRiskFixed = async (riskId) => {
    try {
        const response = await expressApiIT.patch(`/risks/${riskId}/fix`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get risk statistics
 * @returns {Promise} Response with statistics
 */
export const getRiskStats = async () => {
    try {
        const response = await expressApiIT.get('/risks/stats');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// BEST PRACTICES ENDPOINTS
// ============================================

/**
 * Analyze code for best practices violations
 * @param {string} code - Code to analyze
 * @param {string} sessionId - Optional session ID
 * @returns {Promise} Response with best practices analysis
 */
export const analyzeBestPractices = async (code, sessionId = null) => {
    try {
        const response = await expressApiIT.post('/best-practices/analyze', {
            code,
            sessionId
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get best practices by session ID
 * @param {string} sessionId - Session ID
 * @returns {Promise} Response with best practices
 */
export const getBestPracticesBySession = async (sessionId) => {
    try {
        const response = await expressApiIT.get(`/best-practices/session/${sessionId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Mark practice as applied
 * @param {string} practiceId - Practice ID
 * @returns {Promise} Response
 */
export const markPracticeApplied = async (practiceId) => {
    try {
        const response = await expressApiIT.patch(`/best-practices/${practiceId}/apply`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get best practices statistics
 * @returns {Promise} Response with statistics
 */
export const getBestPracticesStats = async () => {
    try {
        const response = await expressApiIT.get('/best-practices/stats');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// METRICS ENDPOINTS
// ============================================

/**
 * Analyze code quality metrics
 * @param {string} code - Code to analyze
 * @returns {Promise} Response with metrics
 */
export const analyzeMetrics = async (code) => {
    try {
        const response = await expressApi.post('/refactor/analyze-metrics', {
            code
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Compare metrics between original and refactored code
 * @param {string} originalCode - Original code
 * @param {string} refactoredCode - Refactored code
 * @param {string} historyId - Optional history ID
 * @returns {Promise} Response with comparison
 */
export const compareMetrics = async (originalCode, refactoredCode, historyId = null) => {
    try {
        const response = await expressApi.post('/refactor/compare-metrics', {
            originalCode,
            refactoredCode,
            historyId
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// TESTING ENDPOINTS
// ============================================

/**
 * Generate tests for code
 * @param {string} code - Code to generate tests for
 * @returns {Promise} Response with generated tests
 */
export const generateTests = async (code) => {
    try {
        const response = await expressApi.post('/refactor/generate-tests', {
            code
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// EXPLAINABLE AI ENDPOINTS
// ============================================

/**
 * Get explanation for refactoring changes
 * @param {string} originalCode - Original code
 * @param {string} refactoredCode - Refactored code
 * @returns {Promise} Response with explanation
 */
export const getExplanation = async (originalCode, refactoredCode) => {
    try {
        const response = await expressApi.post('/refactor/explain', {
            originalCode,
            refactoredCode
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

/**
 * Get analytics dashboard data
 * @returns {Promise} Response with dashboard data
 */
export const getAnalyticsDashboard = async () => {
    try {
        const response = await expressApiIT.get('/analytics/dashboard');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get quality trends over time
 * @param {number} days - Number of days to analyze
 * @returns {Promise} Response with trends
 */
export const getQualityTrends = async (days = 30) => {
    try {
        const response = await expressApiIT.get('/analytics/quality-trends', {
            params: { days }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get model comparison analytics
 * @returns {Promise} Response with model comparison
 */
export const getModelComparison = async () => {
    try {
        const response = await expressApiIT.get('/analytics/model-comparison');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get top refactorings
 * @param {number} limit - Number of results to return
 * @returns {Promise} Response with top refactorings
 */
export const getTopRefactorings = async (limit = 10) => {
    try {
        const response = await expressApiIT.get('/analytics/top-refactorings', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// HISTORY ENDPOINTS
// ============================================

/**
 * Get refactoring history with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} modelUsed - Optional model filter
 * @param {string} sortBy - Sort field
 * @returns {Promise} Response with history
 */
export const getHistory = async (page = 1, limit = 10, modelUsed = null, sortBy = 'createdAt') => {
    try {
        const params = { page, limit, sortBy };
        if (modelUsed) params.modelUsed = modelUsed;

        const response = await expressApi.get('/history', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get history by ID
 * @param {string} id - History item ID
 * @returns {Promise} Response with history item
 */
export const getHistoryById = async (id) => {
    try {
        const response = await expressApi.get(`/history/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Delete history item
 * @param {string} id - History item ID
 * @returns {Promise} Response
 */
export const deleteHistory = async (id) => {
    try {
        const response = await expressApi.delete(`/history/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting history:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Clear all history
 * @returns {Promise} Response
 */
export const clearAllHistory = async () => {
    try {
        const response = await expressApi.delete('/history/clear');
        return response.data;
    } catch (error) {
        console.error('Error clearing history:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get history statistics
 * @returns {Promise} Response with statistics
 */
export const getHistoryStats = async () => {
    try {
        const response = await expressApi.get('/history/stats');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get recent history
 * @param {number} limit - Number of items to return
 * @returns {Promise} Response with recent history
 */
export const getRecentHistory = async (limit = 5) => {
    try {
        const response = await expressApi.get('/history/recent', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Search history
 * @param {string} query - Search query
 * @param {string} language - Language filter
 * @param {string} modelUsed - Model filter
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} Response with search results
 */
export const searchHistory = async (query, language = null, modelUsed = null, page = 1, limit = 10) => {
    try {
        const params = { query, page, limit };
        if (language) params.language = language;
        if (modelUsed) params.modelUsed = modelUsed;

        const response = await expressApi.get('/history/search', { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Save user feedback
 * @param {string} historyId - History item ID
 * @param {number} rating - Rating (1-5)
 * @param {string} feedback - Feedback text
 * @param {boolean} accepted - Whether code was accepted
 * @returns {Promise} Response
 */
export const saveFeedback = async (historyId, rating, feedback, accepted) => {
    try {
        const response = await expressApi.post('/refactor/feedback', {
            historyId,
            rating,
            feedback,
            accepted
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check ML service health
 * @returns {Promise} Health status
 */
export const checkMLHealth = async () => {
    try {
        const response = await mlApi.get('/health');
        return response.data;
    } catch (error) {
        throw new Error('ML service is not available');
    }
};

/**
 * Check Express backend health
 * @returns {Promise} Health status
 */
export const checkBackendHealth = async () => {
    try {
        const response = await expressApi.get('/health');
        return response.data;
    } catch (error) {
        throw new Error('Backend service is not available');
    }
};

// ============================================
// EXPORTS
// ============================================

export default expressApi;
export { mlApi, expressApiIT };