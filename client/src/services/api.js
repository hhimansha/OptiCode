// ============================================
// OPTICODE/client/src/services/api.js
// API service with Two-Stage Refactoring Support
// Stage 1: Local Trained Model
// Stage 2: DeepSeek API
// ============================================

import axios from 'axios';

// API URLs
const EXPRESS_API_URL = 'http://localhost:5000/api';  // Primary Express backend
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';  // Python ML Service
const RISK_API_URL = 'http://localhost:8001';  // Risk Analysis Service

// Create axios instance for primary Express backend
const expressApi = axios.create({
    baseURL: EXPRESS_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Create axios instance for ML service (Python backend with two-stage refactoring)
const mlApi = axios.create({
    baseURL: ML_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 120 seconds for two-stage process (local model + DeepSeek)
});

// Create axios instance for Risk Analysis service
const riskApi = axios.create({
    baseURL: RISK_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for risk analysis
});

// ============================================
// REFACTORING ENDPOINTS (TWO-STAGE)
// ============================================

/**
 * Refactor code using two-stage process:
 * Stage 1: Local trained model (if available)
 * Stage 2: DeepSeek API for final polish
 * 
 * @param {string} code - Code to refactor
 * @param {string} instruction - Refactoring instruction (optional)
 * @param {string} language - Programming language (default: 'python')
 * @returns {Promise} Response with refactored code and pipeline info
 */
export const refactorCode = async (code, instruction = null, language = 'python') => {
    try {
        console.log('[API] Calling Python ML service for two-stage refactoring...');
        console.log('[API] Stage 1: Local trained model');
        console.log('[API] Stage 2: DeepSeek API');
        
        const requestData = {
            code: code,
            language: language
        };
        
        // Add instruction if provided
        if (instruction) {
            requestData.instruction = instruction;
        }
        
        const response = await mlApi.post('/api/refactor', requestData);
        
        console.log('[API] Refactoring response:', response.data);
        
        // Log pipeline information
        if (response.data.pipeline_info) {
            const info = response.data.pipeline_info;
            console.log(`[API] Pipeline: ${info.stages} stage(s)`);
            console.log(`[API] Local model used: ${info.local_model_used ? 'Yes' : 'No'}`);
            console.log(`[API] DeepSeek used: ${info.deepseek_used ? 'Yes' : 'No'}`);
        }
        
        // Log warning if present
        if (response.data.warning) {
            console.warn('[API] Warning:', response.data.warning);
        }
        
        return response.data;
        
    } catch (error) {
        console.error('[API] Refactoring error:', error);
        
        if (error.response) {
            // Server responded with error
            const errorMessage = error.response.data.message || 'Failed to refactor code';
            
            // Provide helpful error messages
            if (error.response.status === 500) {
                throw new Error(`Refactoring failed: ${errorMessage}. Please check if the Python backend is properly configured.`);
            } else {
                throw new Error(errorMessage);
            }
        } else if (error.request) {
            // Request made but no response
            throw new Error(
                `Cannot connect to ML service at ${ML_API_URL}. ` +
                'Please ensure:\n' +
                '1. Python backend is running (python refactor_api.py)\n' +
                '2. LOCAL_MODEL_PATH environment variable is set (if using local model)\n' +
                '3. All dependencies are installed (pip install -r requirements.txt)'
            );
        } else {
            // Something else went wrong
            throw new Error(error.message || 'An unexpected error occurred during refactoring');
        }
    }
};

/**
 * Analyze refactoring risk between original and refactored code
 * @param {string} originalCode - Original code
 * @param {string} refactoredCode - Refactored code
 * @param {string} language - Programming language
 * @returns {Promise} Response with risk analysis and chart data
 */
export const analyzeRefactoringRisk = async (originalCode, refactoredCode, language = 'python') => {
    try {
        console.log('[API] Calling Risk Analysis service...');
        console.log('[API] Original code length:', originalCode.length);
        console.log('[API] Refactored code length:', refactoredCode.length);
        
        const requestData = {
            original_code: originalCode,
            refactored_code: refactoredCode,
            language: language
        };
        
        // Note: Risk analysis runs on port 8001
        const response = await riskApi.post('/api/risk-analyze', requestData);
        
        console.log('[API] Risk analysis response:', response.data);
        
        // Log risk details
        if (response.data.risk_analysis) {
            const risk = response.data.risk_analysis;
            console.log(`[API] Risk Score: ${risk.risk_score} (${risk.risk_level})`);
            console.log(`[API] Recommendation: ${risk.recommendation}`);
        }
        
        return response.data;
        
    } catch (error) {
        console.error('[API] Risk analysis error:', error);
        
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to analyze risk');
        } else if (error.request) {
            throw new Error(
                `Cannot connect to Risk Analysis service. ` +
                'Please ensure:\n' +
                '1. Risk analysis backend is running (python risk_analysis_api.py)\n' +
                '2. Port 8001 is available\n' +
                '3. OpenRouter API key is valid'
            );
        } else {
            throw new Error(error.message || 'An unexpected error occurred during risk analysis');
        }
    }
};

/**
 * Execute code and get output
 * @param {string} code - Code to execute
 * @returns {Promise} Response with execution output/error
 */
export const executeCode = async (code) => {
    try {
        console.log('[API] Calling Python ML service for code execution...');
        
        const response = await mlApi.post('/api/execute', {
            code: code
        });
        
        console.log('[API] Execution response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('[API] Execution error:', error);
        
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to execute code');
        } else if (error.request) {
            throw new Error(
                `Cannot connect to ML service at ${ML_API_URL}. ` +
                'Make sure Python backend is running on port 8000.'
            );
        } else {
            throw new Error(error.message || 'An unexpected error occurred during execution');
        }
    }
};

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

/**
 * Check ML service health and pipeline status
 * @returns {Promise} Health status with pipeline information
 */
export const checkMLHealth = async () => {
    try {
        const response = await mlApi.get('/health');
        
        console.log('[API] ML Service Health:', response.data);
        
        // Check if local model is available
        if (response.data.local_model && !response.data.local_model.loaded) {
            console.warn('[API] Local model is not loaded. Only DeepSeek API will be used.');
            console.warn('[API] To enable two-stage refactoring, set LOCAL_MODEL_PATH environment variable.');
        }
        
        return response.data;
        
    } catch (error) {
        throw new Error(`ML service is not available at ${ML_API_URL}`);
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
        throw new Error(`Backend service is not available at ${EXPRESS_API_URL}`);
    }
};

/**
 * Check risk analysis service health
 * @returns {Promise} Health status
 */
export const checkRiskAnalysisHealth = async () => {
    try {
        const response = await riskApi.get('/health');
        console.log('[API] Risk Analysis Service Health:', response.data);
        return response.data;
    } catch (error) {
        throw new Error(`Risk analysis service is not available at ${RISK_API_URL}`);
    }
};

// ============================================
// HISTORY ENDPOINTS (EXPRESS BACKEND)
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
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if two-stage refactoring is available
 * @returns {Promise<boolean>} True if local model is loaded
 */
export const isTwoStageAvailable = async () => {
    try {
        const health = await checkMLHealth();
        return health.local_model?.loaded === true;
    } catch (error) {
        console.error('[API] Failed to check two-stage availability:', error);
        return false;
    }
};

/**
 * Get pipeline configuration information
 * @returns {Promise<Object>} Pipeline configuration details
 */
export const getPipelineConfig = async () => {
    try {
        const health = await checkMLHealth();
        
        return {
            twoStageEnabled: health.two_stage_refactoring || false,
            localModel: {
                enabled: health.local_model?.enabled || false,
                loaded: health.local_model?.loaded || false,
                path: health.local_model?.path || null,
                device: health.local_model?.device || null
            },
            deepseekApi: {
                enabled: health.deepseek_api?.enabled || false,
                model: health.deepseek_api?.model || 'unknown'
            }
        };
    } catch (error) {
        console.error('[API] Failed to get pipeline config:', error);
        return null;
    }
};

// ============================================
// EXPORTS
// ============================================

export default expressApi;
export { mlApi, riskApi };