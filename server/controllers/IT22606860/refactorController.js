import axios from 'axios';
import RefactorHistory from '../../models/IT22606860/RefactorHistory.js';
import CodeRisk from '../../models/IT22606860/CodeRisk.js';
import BestPractice from '../../models/IT22606860/BestPractice.js';

// Python ML API URL
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// Helper to compute basic quality metrics from code
const computeBasicMetrics = (code) => {
    const lines = code.split('\n');
    const loc = lines.length;
    const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
    // Simple cyclomatic complexity estimation
    const complexityKeywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'catch', 'switch', 'case', '&&', '||', 'and', 'or'];
    let complexity = 1;
    complexityKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        const matches = code.match(regex);
        if (matches) complexity += matches.length;
    });
    // Maintainability index (simplified Halstead-based)
    const maintainabilityIndex = Math.max(0, Math.min(100,
        171 - 5.2 * Math.log(Math.max(1, complexity)) - 0.23 * complexity - 16.2 * Math.log(Math.max(1, loc))
    ));
    return { loc, complexity, maintainabilityIndex: parseFloat(maintainabilityIndex.toFixed(2)) };
};

// Refactor code endpoint
export const refactorCode = async (req, res, next) => {
    try {
        const { code, instruction, language } = req.body;

        // Validate input
        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        if (!instruction) {
            return res.status(400).json({
                success: false,
                message: 'Instruction is required'
            });
        }

        console.log(`[REFACTOR] Processing ${code.length} characters of ${language || 'javascript'} code...`);

        const startTime = Date.now();

        try {
            // Call Python ML service
            const response = await axios.post(`${ML_API_URL}/api/refactor`, {
                code,
                instruction: instruction || 'Refactor this code',
                language: language || 'javascript'
            }, {
                timeout: 30000
            });

            if (response.data.success) {
                const processingTime = Date.now() - startTime;

                // Compute quality metrics
                const beforeMetrics = computeBasicMetrics(code);
                const afterMetrics = computeBasicMetrics(response.data.refactored_code);
                const improvement = {
                    locReduction: parseFloat(((beforeMetrics.loc - afterMetrics.loc) / Math.max(beforeMetrics.loc, 1) * 100).toFixed(2)),
                    complexityReduction: parseFloat(((beforeMetrics.complexity - afterMetrics.complexity) / Math.max(beforeMetrics.complexity, 1) * 100).toFixed(2)),
                    maintainabilityImprovement: parseFloat((afterMetrics.maintainabilityIndex - beforeMetrics.maintainabilityIndex).toFixed(2)),
                    overallScore: parseFloat((((afterMetrics.maintainabilityIndex - beforeMetrics.maintainabilityIndex) + ((beforeMetrics.complexity - afterMetrics.complexity) / Math.max(beforeMetrics.complexity, 1) * 100)) / 2).toFixed(2))
                };

                // Save to history with userId and quality metrics
                const history = await RefactorHistory.create({
                    userId: req.userId || null,
                    inputCode: code,
                    originalCode: code,
                    refactoredCode: response.data.refactored_code,
                    language: language || 'javascript',
                    instruction: instruction || 'Refactor this code',
                    modelUsed: 'trained',
                    processingTime: response.data.processing_time || processingTime,
                    status: 'completed',
                    qualityMetrics: {
                        before: beforeMetrics,
                        after: afterMetrics,
                        improvement
                    }
                });

                return res.status(200).json({
                    success: true,
                    data: {
                        refactoredCode: response.data.refactored_code,
                        processingTime: response.data.processing_time || processingTime,
                        historyId: history._id
                    },
                    refactored_code: response.data.refactored_code,
                    processing_time: response.data.processing_time || processingTime,
                    message: 'Code refactored successfully',
                    historyId: history._id
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: response.data.message || 'Refactoring failed'
                });
            }
        } catch (mlError) {
            // Fallback to placeholder if ML service is unavailable
            console.warn('[REFACTOR] ML service unavailable, using placeholder:', mlError.message);
            
            const processingTime = Date.now() - startTime;
            const refactoredCode = `// Refactored based on: ${instruction}\n${code}`;

            // Compute quality metrics for fallback
            const fbBeforeMetrics = computeBasicMetrics(code);
            const fbAfterMetrics = computeBasicMetrics(refactoredCode);
            const fbImprovement = {
                locReduction: parseFloat(((fbBeforeMetrics.loc - fbAfterMetrics.loc) / Math.max(fbBeforeMetrics.loc, 1) * 100).toFixed(2)),
                complexityReduction: parseFloat(((fbBeforeMetrics.complexity - fbAfterMetrics.complexity) / Math.max(fbBeforeMetrics.complexity, 1) * 100).toFixed(2)),
                maintainabilityImprovement: parseFloat((fbAfterMetrics.maintainabilityIndex - fbBeforeMetrics.maintainabilityIndex).toFixed(2)),
                overallScore: 0
            };

            // Save to history with userId
            const historyEntry = await RefactorHistory.create({
                userId: req.userId || null,
                inputCode: code,
                originalCode: code,
                refactoredCode,
                instruction,
                language: language || 'javascript',
                status: 'completed',
                processingTime,
                modelUsed: 'rules',
                qualityMetrics: {
                    before: fbBeforeMetrics,
                    after: fbAfterMetrics,
                    improvement: fbImprovement
                }
            });

            return res.status(200).json({
                success: true,
                data: {
                    refactoredCode,
                    processingTime,
                    historyId: historyEntry._id
                },
                message: 'Code refactored using fallback method (ML service unavailable)'
            });
        }

    } catch (error) {
        console.error('[REFACTOR] Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'Python ML service is not available. Please ensure the service is running.'
            });
        }

        next(error);
    }
};

// Multi-model refactoring
export const multiModelRefactor = async (req, res, next) => {
    try {
        const { code, instruction, language } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        console.log('[MULTI-MODEL] Starting multi-model refactoring...');

        // Call Python ML service for multi-model comparison
        const response = await axios.post(`${ML_API_URL}/api/multi-refactor`, {
            code,
            instruction: instruction || 'Refactor this code',
            language: language || 'javascript'
        }, {
            timeout: 60000  // 60 seconds for multiple models
        });

        if (response.data.success) {
            return res.json({
                success: true,
                models: response.data.models,
                comparison: response.data.comparison,
                message: 'Multi-model refactoring completed'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: response.data.message || 'Multi-model refactoring failed'
            });
        }

    } catch (error) {
        console.error('[MULTI-MODEL] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Execute code endpoint
export const executeCode = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        console.log('[EXECUTE] Running code...');

        // Call Python ML service
        const response = await axios.post(`${ML_API_URL}/api/execute`, {
            code
        }, {
            timeout: 15000  // 15 seconds
        });

        return res.json(response.data);

    } catch (error) {
        console.error('[EXECUTE] Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'Python execution service is not available'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Analyze code quality metrics
export const analyzeMetrics = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        console.log('[METRICS] Analyzing code quality...');

        const response = await axios.post(`${ML_API_URL}/api/analyze-metrics`, {
            code
        }, {
            timeout: 10000
        });

        return res.json(response.data);

    } catch (error) {
        console.error('[METRICS] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Compare code quality (before/after)
export const compareMetrics = async (req, res, next) => {
    try {
        const { originalCode, refactoredCode } = req.body;

        if (!originalCode || !refactoredCode) {
            return res.status(400).json({
                success: false,
                message: 'Both original and refactored code are required'
            });
        }

        console.log('[COMPARE] Comparing code metrics...');

        const response = await axios.post(`${ML_API_URL}/api/compare-metrics`, {
            original_code: originalCode,
            refactored_code: refactoredCode
        }, {
            timeout: 15000
        });

        // Save metrics to history if historyId provided
        if (req.body.historyId && response.data.success) {
            await RefactorHistory.findByIdAndUpdate(req.body.historyId, {
                qualityMetrics: response.data.metrics
            });
        }

        return res.json(response.data);

    } catch (error) {
        console.error('[COMPARE] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Generate tests
export const generateTests = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        console.log('[TESTS] Generating tests...');

        const response = await axios.post(`${ML_API_URL}/api/generate-tests`, {
            code
        }, {
            timeout: 30000
        });

        return res.json(response.data);

    } catch (error) {
        console.error('[TESTS] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Get refactoring explanation
export const getExplanation = async (req, res, next) => {
    try {
        const { originalCode, refactoredCode } = req.body;

        if (!originalCode || !refactoredCode) {
            return res.status(400).json({
                success: false,
                message: 'Both codes are required'
            });
        }

        console.log('[EXPLAIN] Generating explanation...');

        const response = await axios.post(`${ML_API_URL}/api/explain`, {
            original_code: originalCode,
            refactored_code: refactoredCode
        }, {
            timeout: 20000
        });

        return res.json(response.data);

    } catch (error) {
        console.error('[EXPLAIN] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Save user feedback
export const saveFeedback = async (req, res, next) => {
    try {
        const { historyId, rating, feedback, accepted } = req.body;

        if (!historyId) {
            return res.status(400).json({
                success: false,
                message: 'History ID is required'
            });
        }

        const history = await RefactorHistory.findByIdAndUpdate(
            historyId,
            {
                userRating: rating,
                userFeedback: feedback,
                accepted: accepted
            },
            { new: true }
        );

        if (!history) {
            return res.status(404).json({
                success: false,
                message: 'Refactoring history not found'
            });
        }

        return res.json({
            success: true,
            message: 'Feedback saved successfully',
            history
        });

    } catch (error) {
        console.error('[FEEDBACK] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get refactoring suggestions
export const getSuggestions = async (req, res, next) => {
    try {
        const { code, language = 'javascript' } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        try {
            // Try to get AI-based suggestions from ML service
            const response = await axios.post(`${ML_API_URL}/api/suggestions`, {
                code,
                language
            }, {
                timeout: 10000
            });

            if (response.data.success) {
                return res.status(200).json({
                    success: true,
                    data: { suggestions: response.data.suggestions }
                });
            }
        } catch (mlError) {
            console.warn('[SUGGESTIONS] ML service unavailable, using default suggestions');
        }

        // Fallback to default suggestions
        const suggestions = [
            'Consider using const instead of var',
            'Add error handling',
            'Improve variable naming',
            'Add code comments for complex logic',
            'Consider breaking down large functions'
        ];

        res.status(200).json({
            success: true,
            data: { suggestions }
        });
    } catch (error) {
        console.error('[SUGGESTIONS] Error:', error.message);
        next(error);
    }
};