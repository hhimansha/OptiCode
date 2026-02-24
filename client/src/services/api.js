// ============================================
// OPTICODE/client/src/services/api.js
// API service with Advanced Refactoring Features
// Includes: Priority Patterns, Advanced AST, Architecture Analysis, etc.
// ============================================

import axios from 'axios';

// API URLs
const EXPRESS_API_URL = 'http://localhost:5000/api';  // Primary Express backend
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';  // Python Refactoring Service
const RISK_API_URL = import.meta.env.VITE_RISK_API_URL || 'http://localhost:8001';  // Risk Analysis Service

// Create axios instance for primary Express backend
const expressApi = axios.create({
    baseURL: EXPRESS_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
    withCredentials: true, // Send cookies for auth
});

// Create axios instance for ML/Refactoring service
const mlApi = axios.create({
    baseURL: ML_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 120 seconds for comprehensive analysis
});

// Create axios instance for Risk Analysis service
const riskApi = axios.create({
    baseURL: RISK_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds
});

// ============================================
// 🚀 UNIFIED COMPREHENSIVE REFACTORING (RECOMMENDED)
// ============================================

/**
 * Apply ALL refactoring patterns in one call (RECOMMENDED)
 * Combines: Basic AST + Priority + Advanced + Performance
 * 
 * @param {string} code - Code to refactor
 * @param {Object} options - Optional configuration:
 *   - apply_basic: bool (default true)
 *   - apply_priority: bool (default true) 
 *   - apply_advanced: bool (default true)
 *   - apply_performance: bool (default true)
 *   - categories: Array<string> (optional filter for advanced)
 * @returns {Promise} Comprehensive refactoring results
 */
export const applyCompleteRefactoring = async (code, options = {}) => {
    try {
        console.log('[API] 🚀 Calling UNIFIED comprehensive refactoring...');

        const requestData = {
            code: code,
            apply_basic: options.apply_basic !== false,
            apply_priority: options.apply_priority !== false,
            apply_advanced: options.apply_advanced !== false,
            apply_performance: options.apply_performance !== false,
            categories: options.categories || null
        };

        const response = await mlApi.post('/api/refactor-full', requestData);

        console.log('[API] ✅ Unified refactoring response:', response.data);
        console.log(`[API] Total changes: ${response.data.summary?.total_changes || 0}`);
        console.log(`[API] Processing time: ${response.data.summary?.processing_time_ms || 0}ms`);
        console.log('[API] Stages applied:', Object.keys(response.data.stages || {}));

        return response.data;

    } catch (error) {
        console.error('[API] Unified refactoring error:', error);
        handleApiError(error, 'unified refactoring');
    }
};

/**
 * Get ALL available refactoring patterns from all modules
 * @returns {Promise} Response with all patterns from all modules
 */
export const getAllAvailablePatterns = async () => {
    try {
        const response = await mlApi.get('/api/patterns/all');
        console.log('[API] All available patterns:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] Get all available patterns error:', error);
        handleApiError(error, 'fetching all patterns');
    }
};

// ============================================
// PRIORITY REFACTORING ENDPOINTS (FASTEST)
// ============================================

/**
 * Apply top 15 priority refactoring patterns (FASTEST option)
 * Includes: Dead code removal, duplicates, comprehensions, guard clauses, etc.
 * 
 * @param {string} code - Code to refactor
 * @returns {Promise} Response with detected patterns and refactored code
 */
export const applyPriorityRefactoring = async (code) => {
    try {
        console.log('[API] Calling priority refactoring (15 patterns)...');

        const response = await mlApi.post('/api/priority-refactor', {
            code: code
        });

        console.log('[API] Priority refactoring response:', response.data);
        console.log(`[API] Patterns applied: ${response.data.patterns_applied}`);
        console.log(`[API] Changes detected: ${response.data.changes?.length || 0}`);

        return response.data;

    } catch (error) {
        console.error('[API] Priority refactoring error:', error);
        handleApiError(error, 'priority refactoring');
    }
};

/**
 * Get list of all 20 priority patterns
 * @returns {Promise} Response with pattern list
 */
export const getPriorityPatterns = async () => {
    try {
        const response = await mlApi.get('/api/priority-patterns');
        console.log('[API] Priority patterns:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] Get priority patterns error:', error);
        handleApiError(error, 'fetching priority patterns');
    }
};

// ============================================
// ADVANCED REFACTORING ENDPOINTS
// ============================================

/**
 * Apply comprehensive refactoring with 100+ patterns across 12 categories
 * 
 * @param {string} code - Code to refactor
 * @param {Array<string>} categories - Optional category filters
 *   Available: 'Naming & Readability', 'Function Refactoring', 
 *              'Conditional Simplification', 'Variable Management',
 *              'Class & Object', 'Module Organization', 'Python-Specific',
 *              'Performance Optimization', 'Error Handling', 'Architecture Patterns',
 *              'Testing & Testability', 'Code Style'
 * @returns {Promise} Response with comprehensive refactoring results
 */
export const applyAdvancedRefactoring = async (code, categories = null) => {
    try {
        console.log('[API] Calling advanced refactoring (100+ patterns)...');

        const requestData = { code: code };
        if (categories && categories.length > 0) {
            requestData.categories = categories;
        }

        const response = await mlApi.post('/api/advanced-refactor', requestData);

        console.log('[API] Advanced refactoring response:', response.data);
        console.log(`[API] Changes applied: ${response.data.metrics?.changes_applied || 0}`);
        console.log(`[API] Improvement score: ${response.data.metrics?.improvement_score || 0}%`);

        return response.data;

    } catch (error) {
        console.error('[API] Advanced refactoring error:', error);
        handleApiError(error, 'advanced refactoring');
    }
};

/**
 * Get list of all available refactoring patterns
 * @returns {Promise} Response with all patterns grouped by category
 */
export const getAllPatterns = async () => {
    try {
        const response = await mlApi.get('/api/list-patterns');
        console.log('[API] All patterns:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] Get all patterns error:', error);
        handleApiError(error, 'fetching patterns');
    }
};

/**
 * Basic AST refactoring (simpler than advanced)
 * @param {string} code - Code to refactor
 * @returns {Promise} Response with basic refactoring
 */
export const refactorCode = async (code) => {
    try {
        console.log('[API] Calling basic AST refactoring...');

        const response = await mlApi.post('/api/refactor', {
            code: code
        });

        console.log('[API] Basic refactoring response:', response.data);
        return response.data;

    } catch (error) {
        console.error('[API] Basic refactoring error:', error);
        handleApiError(error, 'basic refactoring');
    }
};

// ============================================
// CODE ANALYSIS ENDPOINTS
// ============================================

/**
 * Comprehensive code analysis with quality metrics
 * Includes: complexity, maintainability, security, style compliance
 * 
 * @param {string} code - Code to analyze
 * @returns {Promise} Response with analysis metrics
 */
export const analyzeCode = async (code) => {
    try {
        console.log('[API] Calling code analysis...');

        const response = await mlApi.post('/api/analyze', {
            code: code
        });

        console.log('[API] Code analysis response:', response.data);

        if (response.data.analysis) {
            const { complexity, maintainability, security } = response.data.analysis;
            console.log(`[API] Cyclomatic complexity: ${complexity?.cyclomatic || 'N/A'}`);
            console.log(`[API] Maintainability index: ${maintainability?.index || 'N/A'}`);
            console.log(`[API] Security issues: ${security?.vulnerabilities || 0}`);
        }

        return response.data;

    } catch (error) {
        console.error('[API] Code analysis error:', error);
        handleApiError(error, 'code analysis');
    }
};

/**
 * Check code against Python best practices
 * @param {string} code - Code to check
 * @returns {Promise} Response with best practice violations
 */
export const checkBestPractices = async (code) => {
    try {
        console.log('[API] Checking best practices...');

        const response = await mlApi.post('/api/best-practices', {
            code: code
        });

        console.log('[API] Best practices response:', response.data);
        return response.data;

    } catch (error) {
        console.error('[API] Best practices error:', error);
        handleApiError(error, 'best practices check');
    }
};

/**
 * Analyze code architecture and detect anti-patterns
 * Detects: God classes, long methods, high coupling, design pattern opportunities
 * 
 * @param {string} code - Code to analyze
 * @returns {Promise} Response with architecture analysis
 */
export const analyzeArchitecture = async (code) => {
    try {
        console.log('[API] Calling architecture analysis...');

        const response = await mlApi.post('/api/architecture-analyze', {
            code: code
        });

        console.log('[API] Architecture analysis response:', response.data);

        if (response.data.anti_patterns) {
            console.log(`[API] Anti-patterns found: ${response.data.anti_patterns.length}`);
        }
        if (response.data.design_patterns) {
            console.log(`[API] Design pattern suggestions: ${response.data.design_patterns.length}`);
        }

        return response.data;

    } catch (error) {
        console.error('[API] Architecture analysis error:', error);
        handleApiError(error, 'architecture analysis');
    }
};

// ============================================
// CODE GENERATION ENDPOINTS
// ============================================

/**
 * Generate unit tests for the provided code
 * @param {string} code - Code to generate tests for
 * @param {string} framework - Test framework ('pytest', 'unittest')
 * @returns {Promise} Response with generated test code
 */
export const generateTests = async (code, framework = 'pytest') => {
    try {
        console.log('[API] Generating unit tests...');

        const response = await mlApi.post('/api/generate-tests', {
            code: code,
            framework: framework
        });

        console.log('[API] Test generation response:', response.data);
        return response.data;

    } catch (error) {
        console.error('[API] Test generation error:', error);
        handleApiError(error, 'test generation');
    }
};

// ============================================
// PERFORMANCE OPTIMIZATION ENDPOINTS
// ============================================

/**
 * Analyze and optimize code performance
 * Detects: inefficient loops, data structure issues, algorithm improvements
 * 
 * @param {string} code - Code to optimize
 * @returns {Promise} Response with performance optimizations
 */
export const optimizePerformance = async (code) => {
    try {
        console.log('[API] Calling performance optimizer...');

        const response = await mlApi.post('/api/optimize-performance', {
            code: code
        });

        console.log('[API] Performance optimization response:', response.data);
        return response.data;

    } catch (error) {
        console.error('[API] Performance optimization error:', error);
        handleApiError(error, 'performance optimization');
    }
};

// ============================================
// RISK ANALYSIS ENDPOINTS (Port 8001)
// ============================================

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

        const response = await riskApi.post('/api/risk-analyze', {
            original_code: originalCode,
            refactored_code: refactoredCode,
            language: language
        });

        console.log('[API] Risk analysis response:', response.data);

        if (response.data.risk_analysis) {
            const risk = response.data.risk_analysis;
            console.log(`[API] Risk Score: ${risk.risk_score} (${risk.risk_level})`);
            console.log(`[API] Recommendation: ${risk.recommendation}`);
        }

        return response.data;

    } catch (error) {
        console.error('[API] Risk analysis error:', error);
        handleApiError(error, 'risk analysis', RISK_API_URL);
    }
};

// ============================================
// CODE EXECUTION ENDPOINTS
// ============================================

/**
 * Execute Python code and get output
 * @param {string} code - Code to execute
 * @returns {Promise} Response with execution output/error
 */
export const executeCode = async (code) => {
    try {
        console.log('[API] Executing code...');

        const response = await mlApi.post('/api/execute', {
            code: code
        });

        console.log('[API] Execution response:', response.data);
        return response.data;

    } catch (error) {
        console.error('[API] Execution error:', error);
        handleApiError(error, 'code execution');
    }
};

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

/**
 * Check refactoring service health and available features
 * @returns {Promise} Health status with feature availability
 */
export const checkMLHealth = async () => {
    try {
        const response = await mlApi.get('/health');

        console.log('[API] Refactoring Service Health:', response.data);
        console.log(`[API] Version: ${response.data.version || 'N/A'}`);
        console.log(`[API] Mode: ${response.data.mode || 'N/A'}`);

        return response.data;

    } catch (error) {
        throw new Error(`Refactoring service is not available at ${ML_API_URL}`);
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

/**
 * Check all services health
 * @returns {Promise<Object>} Status of all services
 */
export const checkAllServicesHealth = async () => {
    const results = {
        express: { status: 'unknown', error: null },
        refactoring: { status: 'unknown', error: null, features: [] },
        riskAnalysis: { status: 'unknown', error: null }
    };

    // Check Express backend
    try {
        await checkBackendHealth();
        results.express.status = 'healthy';
    } catch (error) {
        results.express.status = 'unhealthy';
        results.express.error = error.message;
    }

    // Check Refactoring service
    try {
        const health = await checkMLHealth();
        results.refactoring.status = 'healthy';
        results.refactoring.features = [
            'Priority Refactoring (15 patterns)',
            'Advanced Refactoring (100+ patterns)',
            'Code Analysis',
            'Architecture Analysis',
            'Test Generation',
            'Performance Optimization',
            'Best Practices Check'
        ];
        results.refactoring.version = health.version;
        results.refactoring.mode = health.mode;
    } catch (error) {
        results.refactoring.status = 'unhealthy';
        results.refactoring.error = error.message;
    }

    // Check Risk Analysis service
    try {
        await checkRiskAnalysisHealth();
        results.riskAnalysis.status = 'healthy';
    } catch (error) {
        results.riskAnalysis.status = 'unhealthy';
        results.riskAnalysis.error = error.message;
    }

    return results;
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

        const response = await expressApi.get('/IT22606860/history', { params });
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
        const response = await expressApi.get(`/IT22606860/history/${id}`);
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
        const response = await expressApi.delete(`/IT22606860/history/${id}`);
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
        const response = await expressApi.delete('/IT22606860/history/clear');
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
        const response = await expressApi.get('/IT22606860/history/stats');
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
        const response = await expressApi.get('/IT22606860/history/recent', {
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

        const response = await expressApi.get('/IT22606860/history/search', { params });
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
        const response = await expressApi.post('/IT22606860/refactor/feedback', {
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
 * Get available refactoring categories
 * @returns {Array<string>} List of category names
 */
export const getRefactoringCategories = () => {
    return [
        'Naming & Readability',
        'Function Refactoring',
        'Conditional Simplification',
        'Variable Management',
        'Class & Object',
        'Module Organization',
        'Python-Specific',
        'Performance Optimization',
        'Error Handling',
        'Architecture Patterns',
        'Testing & Testability',
        'Code Style'
    ];
};

/**
 * Get refactoring service features
 * @returns {Promise<Object>} Available features and their status
 */
export const getServiceFeatures = async () => {
    try {
        const health = await checkMLHealth();

        return {
            priorityRefactoring: {
                available: true,
                patterns: 15,
                speed: 'fastest',
                endpoint: '/api/priority-refactor'
            },
            advancedRefactoring: {
                available: true,
                patterns: 100,
                categories: 12,
                endpoint: '/api/advanced-refactor'
            },
            codeAnalysis: {
                available: true,
                features: ['complexity', 'maintainability', 'security', 'style'],
                endpoint: '/api/analyze'
            },
            architectureAnalysis: {
                available: true,
                detects: ['anti-patterns', 'design-patterns', 'coupling', 'cohesion'],
                endpoint: '/api/architecture-analyze'
            },
            testGeneration: {
                available: true,
                frameworks: ['pytest', 'unittest'],
                endpoint: '/api/generate-tests'
            },
            performanceOptimization: {
                available: true,
                optimizations: ['loops', 'data-structures', 'algorithms', 'caching'],
                endpoint: '/api/optimize-performance'
            }
        };
    } catch (error) {
        console.error('[API] Failed to get service features:', error);
        return null;
    }
};

/**
 * Error handler helper
 * @param {Error} error - Error object
 * @param {string} operation - Operation name
 * @param {string} serviceUrl - Service URL
 */
const handleApiError = (error, operation, serviceUrl = ML_API_URL) => {
    if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data.error ||
            error.response.data.message ||
            `Failed to ${operation}`;

        if (error.response.status === 500) {
            throw new Error(`${operation} failed: ${errorMessage}. Please check if the Python backend is properly configured.`);
        } else {
            throw new Error(errorMessage);
        }
    } else if (error.request) {
        // Request made but no response
        throw new Error(
            `Cannot connect to service at ${serviceUrl}. ` +
            `Please ensure:\n` +
            `1. Python backend is running (python run_backend.py)\n` +
            `2. All dependencies are installed (pip install -r requirements.txt)\n` +
            `3. Port ${serviceUrl.split(':')[2]} is available`
        );
    } else {
        // Something else went wrong
        throw new Error(error.message || `An unexpected error occurred during ${operation}`);
    }
};

// ============================================
// AI CHATBOT ASSISTANT ENDPOINTS (Port 8001 - LLM Backend)
// ============================================

// Create axios instance for LLM Chatbot service
const llmApi = axios.create({
    baseURL: RISK_API_URL,  // Using port 8001 for LLM
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 90000, // 90 seconds for LLM responses
});

/**
 * Send a chat message to the AI assistant
 * @param {string} message - User's message
 * @param {Array} history - Previous chat messages for context
 * @returns {Promise} Response with AI assistant's reply
 */
export const sendChatMessage = async (message, history = []) => {
    try {
        const response = await llmApi.post('/chat', {
            message,
            history: history.slice(-10) // Send last 10 messages for context
        });
        return {
            success: true,
            message: response.data.response || response.data.message,
            metadata: response.data.metadata || {}
        };
    } catch (error) {
        console.error('Chat API error:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to get chat response'
        };
    }
};

/**
 * Get chat history from backend
 * @returns {Promise} Response with chat history
 */
export const getChatHistory = async () => {
    try {
        const response = await llmApi.get('/chat/history');
        return {
            success: true,
            history: response.data.history || []
        };
    } catch (error) {
        console.error('Get chat history error:', error);
        return {
            success: false,
            history: [],
            error: error.message
        };
    }
};

/**
 * Clear chat history
 * @returns {Promise} Response indicating success
 */
export const clearChatHistory = async () => {
    try {
        await llmApi.delete('/chat/history');
        return { success: true };
    } catch (error) {
        console.error('Clear chat history error:', error);
        throw new Error(error.response?.data?.error || 'Failed to clear chat history');
    }
};

/**
 * Analyze code comparison (before/after) with memory and performance insights
 * @param {string} beforeCode - Original code
 * @param {string} afterCode - Refactored code
 * @param {string} language - Programming language (default: javascript)
 * @returns {Promise} Response with detailed analysis
 */
export const analyzeCodeComparison = async (beforeCode, afterCode, language = 'javascript') => {
    try {
        const response = await llmApi.post('/analyze/comparison', {
            before: beforeCode,
            after: afterCode,
            language
        });
        return {
            success: true,
            analysis: response.data.analysis || response.data
        };
    } catch (error) {
        console.error('Code comparison analysis error:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to analyze code comparison'
        };
    }
};

/**
 * Get refactoring insights and recommendations
 * @param {string} code - Code to analyze
 * @param {string} focusArea - Specific area to focus on (memory, performance, quality, etc.)
 * @returns {Promise} Response with insights
 */
export const getRefactoringInsights = async (code, focusArea = 'general') => {
    try {
        const response = await llmApi.post('/insights', {
            code,
            focus: focusArea
        });
        return {
            success: true,
            insights: response.data.insights || response.data
        };
    } catch (error) {
        console.error('Get refactoring insights error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Check LLM service health
 * @returns {Promise} Health status
 */
export const checkLLMHealth = async () => {
    try {
        const response = await llmApi.get('/health');
        return {
            status: 'online',
            ...response.data
        };
    } catch (error) {
        return {
            status: 'offline',
            error: error.message
        };
    }
};

// ============================================
// DASHBOARD ANALYTICS ENDPOINTS (Authenticated)
// ============================================

/**
 * Get dashboard overview - summary metrics for the authenticated user
 * @returns {Promise} Response with overview data
 */
export const getDashboardOverview = async () => {
    try {
        const response = await expressApi.get('/IT22606860/dashboard/overview');
        return response.data;
    } catch (error) {
        console.error('Dashboard overview error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get code evolution timeline
 * @param {number} days - Number of days to look back
 * @returns {Promise} Response with timeline data
 */
export const getEvolutionTimeline = async (days = 90) => {
    try {
        const response = await expressApi.get('/IT22606860/dashboard/timeline', {
            params: { days }
        });
        return response.data;
    } catch (error) {
        console.error('Timeline error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get session comparison details
 * @param {string} sessionId - History item ID
 * @returns {Promise} Response with comparison data
 */
export const getSessionComparison = async (sessionId) => {
    try {
        const response = await expressApi.get(`/IT22606860/dashboard/comparison/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Comparison error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get performance analytics
 * @returns {Promise} Response with performance data
 */
export const getPerformanceAnalytics = async () => {
    try {
        const response = await expressApi.get('/IT22606860/dashboard/performance');
        return response.data;
    } catch (error) {
        console.error('Performance analytics error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get risk & security analytics
 * @returns {Promise} Response with risk data
 */
export const getRiskSecurityAnalytics = async () => {
    try {
        const response = await expressApi.get('/IT22606860/dashboard/risk-security');
        return response.data;
    } catch (error) {
        console.error('Risk analytics error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get best practice compliance data
 * @returns {Promise} Response with compliance data
 */
export const getBestPracticeCompliance = async () => {
    try {
        const response = await expressApi.get('/IT22606860/dashboard/best-practices');
        return response.data;
    } catch (error) {
        console.error('Best practices error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get technical debt tracker data
 * @returns {Promise} Response with technical debt data
 */
export const getTechnicalDebtTracker = async () => {
    try {
        const response = await expressApi.get('/IT22606860/dashboard/technical-debt');
        return response.data;
    } catch (error) {
        console.error('Technical debt error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

/**
 * Get developer growth score and recommendations
 * @returns {Promise} Response with growth data
 */
export const getDeveloperGrowth = async () => {
    try {
        const response = await expressApi.get('/IT22606860/dashboard/growth');
        return response.data;
    } catch (error) {
        console.error('Growth error:', error);
        throw new Error(error.response?.data?.message || error.message);
    }
};

// ============================================
// EXPORTS
// ============================================

export default expressApi;
export { mlApi, riskApi, llmApi };