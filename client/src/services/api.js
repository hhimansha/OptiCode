// ============================================
// OPTICODE/client/src/services/api.js
// Combined API service - Express Backend + Python ML Service + Compiler
// ============================================

import axios from 'axios';

// API URLs
const EXPRESS_API_URL = 'http://localhost:5000/api';  // Express backend
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';  // Python ML

// Create axios instance for ML service
const mlApi = axios.create({
    baseURL: ML_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// ============================================
// HISTORY ENDPOINTS (Express Backend)
// ============================================

export const getHistory = async (page = 1, limit = 10) => {
    try {
        const response = await fetch(`${EXPRESS_API_URL}/history?page=${page}&limit=${limit}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};

export const deleteHistory = async (id) => {
    try {
        const response = await fetch(`${EXPRESS_API_URL}/history/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting history:', error);
        throw error;
    }
};

export const clearAllHistory = async () => {
    try {
        const response = await fetch(`${EXPRESS_API_URL}/history/clear`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
    }
};

// ============================================
// REFACTOR ENDPOINT (Python ML Service)
// ============================================

/**
 * Refactor code using Python ML model
 * @param {string} code - Code to refactor
 * @param {string} instruction - Refactoring instruction
 * @param {string} language - Programming language
 * @returns {Promise} Response with refactored code
 */
export const refactorCode = async (code, instruction, language) => {
    try {
        const response = await mlApi.post('/api/refactor', {
            code: code,
            instruction: instruction || 'Refactor this code',
            language: language || 'python'
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to refactor code');
        } else if (error.request) {
            throw new Error('Cannot connect to refactoring service. Make sure the Python API is running on ' + ML_API_URL);
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};

// ============================================
// EXECUTE CODE ENDPOINT (Python ML Service)
// ============================================

/**
 * Execute Python code and get output
 * @param {string} code - Python code to execute
 * @returns {Promise} Response with execution output/error
 */
export const executeCode = async (code) => {
    try {
        const response = await mlApi.post('/api/execute', {
            code: code
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to execute code');
        } else if (error.request) {
            throw new Error('Cannot connect to execution service. Make sure the Python API is running on ' + ML_API_URL);
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};

// ============================================
// ML SERVICE HEALTH CHECK
// ============================================

/**
 * Check if ML service is healthy
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

export default mlApi;