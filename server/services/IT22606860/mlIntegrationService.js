const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

class MLIntegrationService {
    constructor() {
        this.apiUrl = ML_API_URL;
        this.timeout = 30000; // 30 seconds
    }

    /**
     * Check if ML service is available
     */
    async checkHealth() {
        try {
            const response = await axios.get(`${this.apiUrl}/health`, {
                timeout: 5000
            });
            return {
                available: true,
                status: response.data
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }

    /**
     * Refactor code using ML service
     */
    async refactorCode(code, instruction = 'Refactor this code', language = 'python') {
        try {
            const response = await axios.post(`${this.apiUrl}/api/refactor`, {
                code,
                instruction,
                language
            }, {
                timeout: this.timeout
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Multi-model refactoring
     */
    async multiModelRefactor(code, instruction, language) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/multi-refactor`, {
                code,
                instruction,
                language
            }, {
                timeout: 60000 // 60 seconds for multiple models
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Execute code
     */
    async executeCode(code) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/execute`, {
                code
            }, {
                timeout: 15000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Analyze code risks
     */
    async analyzeRisks(code) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/analyze-risks`, {
                code
            }, {
                timeout: 15000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Analyze best practices
     */
    async analyzeBestPractices(code) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/analyze-practices`, {
                code
            }, {
                timeout: 15000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Analyze code metrics
     */
    async analyzeMetrics(code) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/analyze-metrics`, {
                code
            }, {
                timeout: 10000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Compare metrics between original and refactored code
     */
    async compareMetrics(originalCode, refactoredCode) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/compare-metrics`, {
                original_code: originalCode,
                refactored_code: refactoredCode
            }, {
                timeout: 15000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Generate tests for code
     */
    async generateTests(code) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/generate-tests`, {
                code
            }, {
                timeout: 30000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Get refactoring explanation
     */
    async getExplanation(originalCode, refactoredCode) {
        try {
            const response = await axios.post(`${this.apiUrl}/api/explain`, {
                original_code: originalCode,
                refactored_code: refactoredCode
            }, {
                timeout: 20000
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
}

module.exports = new MLIntegrationService();