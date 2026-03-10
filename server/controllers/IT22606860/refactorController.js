import axios from 'axios';
import RefactorHistory from '../../models/IT22606860/RefactorHistory.js';
import CodeRisk from '../../models/IT22606860/CodeRisk.js';
import BestPractice from '../../models/IT22606860/BestPractice.js';

// Python ML API URLs
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';
const RISK_API_URL = process.env.RISK_API_URL || 'http://localhost:8001';

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

// Helper to call risk analysis API and get comprehensive risk assessment
const analyzeRisksDetailed = async (originalCode, refactoredCode, language = 'javascript') => {
    try {
        console.log('[RISK] Calling risk analysis API...');
        const response = await axios.post(`${RISK_API_URL}/api/risk-analyze`, {
            original_code: originalCode,
            refactored_code: refactoredCode,
            language: language,
            include_ast_analysis: true
        }, {
            timeout: 30000
        });

        if (response.data && response.data.success) {
            console.log('[RISK] Risk analysis completed successfully');
            console.log('[RISK] Full response.data:', JSON.stringify(response.data, null, 2));
            
            const riskData = response.data.risk_analysis;
            const comparisonMetrics = response.data.comparison_metrics;
            const chartData = response.data.chart_data;
            
            console.log('[RISK] Extracted riskData keys:', Object.keys(riskData || {}));
            console.log('[RISK] Extracted comparisonMetrics:', JSON.stringify(comparisonMetrics, null, 2));
            console.log('[RISK] Extracted chartData:', JSON.stringify(chartData, null, 2));

            return {
                success: true,
                detailed: {
                    riskScore: riskData?.risk_score || 0,
                    riskLevel: riskData?.risk_level || 'medium',
                    riskColor: riskData?.risk_color || '#F59E0B',
                    explanation: riskData?.explanation || '',
                    recommendation: riskData?.recommendation || '',
                    processingTime: riskData?.processing_time || 0,
                    riskFactors: riskData?.risk_factors || [],
                    suggestions: riskData?.suggestions || [],
                    potentialIssues: riskData?.potential_issues || [],
                    sideEffects: riskData?.side_effects || [],
                    comparisonMetrics: comparisonMetrics || {},
                    chartData: chartData || {}
                }
            };
        } else {
            console.warn('[RISK] Risk analysis returned unsuccessful');
            return { success: false };
        }
    } catch (error) {
        console.error('[RISK] Risk analysis failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Helper to analyze and save best practices & security data
const saveBestPracticesAndSecurity = async (originalCode, refactoredCode, historyId, language) => {
    try {
        console.log('\n========================================');
        console.log('[BP&SEC] 🚀 STARTING ANALYSIS');
        console.log('[BP&SEC] History ID:', historyId);
        console.log('[BP&SEC] Code length:', originalCode.length);
        console.log('[BP&SEC] ML API URL:', ML_API_URL);
        console.log('========================================\n');

        // 1. Call Python best practices API
        let bestPracticesData = null;
        try {
            console.log('[BP&SEC] 📞 Calling best practices API...');
            const bpResponse = await axios.post(`${ML_API_URL}/api/best-practices`, {
                code: originalCode
            }, { timeout: 15000 });

            console.log('[BP&SEC] 📥 Response status:', bpResponse.status);
            if (bpResponse.data && bpResponse.data.success) {
                bestPracticesData = bpResponse.data;
                console.log('[BP&SEC] ✅ Best practices analysis completed');
                console.log('[BP&SEC] Violations found:', bestPracticesData.violations?.length || 0);
                console.log('[BP&SEC] Recommendations found:', bestPracticesData.recommendations?.length || 0);
            } else {
                console.log('[BP&SEC] ⚠️ Response success=false');
            }
        } catch (bpError) {
            console.error('[BP&SEC] ❌ Best practices API FAILED:', bpError.message);
            if (bpError.code === 'ECONNREFUSED') {
                console.error('[BP&SEC] 💡 Python backend is NOT RUNNING on port 8000!');
                console.error('[BP&SEC] 💡 Run: python run_backend.py');
            }
        }

        // 2. Call Python code analysis API (includes security via Bandit)
        let securityData = null;
        try {
            console.log('[BP&SEC] 📞 Calling security analysis API...');
            const secResponse = await axios.post(`${ML_API_URL}/api/analyze`, {
                code: originalCode
            }, { timeout: 15000 });

            console.log('[BP&SEC] 📥 Response status:', secResponse.status);
            if (secResponse.data && secResponse.data.success) {
                securityData = secResponse.data.security;
                console.log('[BP&SEC] ✅ Security analysis completed');
                console.log('[BP&SEC] Security issues found:', securityData?.total_issues || 0);
            } else {
                console.log('[BP&SEC] ⚠️ Security response success=false');
            }
        } catch (secError) {
            console.error('[BP&SEC] ❌ Security API FAILED:', secError.message);
            if (secError.code === 'ECONNREFUSED') {
                console.error('[BP&SEC] 💡 Python backend is NOT RUNNING on port 8000!');
            }
        }

        // 3. Save Best Practices violations to database
        let savedBPCount = 0;
        if (bestPracticesData && bestPracticesData.violations) {
            const violations = bestPracticesData.violations;
            console.log(`[BP&SEC] 💾 Saving ${violations.length} best practice violations...`);

            for (const violation of violations) {
                try {
                    // Map severity: high/medium -> error, low -> warning
                    let mappedSeverity = 'warning';
                    if (violation.severity === 'high') mappedSeverity = 'error';
                    else if (violation.severity === 'medium') mappedSeverity = 'warning';
                    else if (violation.severity === 'low') mappedSeverity = 'info';

                    // Map category to allowed values
                    let mappedCategory = 'pythonic';
                    const principle = (violation.principle || '').toLowerCase();
                    if (principle.includes('pep8') || principle.includes('pep 8')) mappedCategory = 'pep8';
                    else if (principle.includes('security')) mappedCategory = 'security';
                    else if (principle.includes('performance')) mappedCategory = 'performance';
                    else if (principle.includes('anti')) mappedCategory = 'anti-pattern';

                    await BestPractice.create({
                        sessionId: historyId.toString(),
                        historyId: historyId,
                        category: mappedCategory,
                        severity: mappedSeverity,
                        line: violation.line || 1,
                        code: violation.code || originalCode.split('\n')[0] || 'N/A',
                        message: violation.description || violation.principle || 'Best practice violation',
                        recommendation: violation.recommendation || 'Follow Python best practices',
                        goodExample: violation.example || '# Good: Follow best practices',
                        badExample: violation.badExample || violation.code || '# Bad: Current code',
                        reference: violation.reference || 'PEP 8 Style Guide',
                        applied: false
                    });
                    savedBPCount++;
                } catch (saveError) {
                    console.error('[BP&SEC] ❌ Failed to save best practice:', saveError.message);
                }
            }
            console.log(`[BP&SEC] ✅ Saved ${savedBPCount}/${violations.length} violations to DB`);
        } else {
            console.log('[BP&SEC] ℹ️ No best practice violations to save');
        }

        // Also save recommendations
        if (bestPracticesData && bestPracticesData.recommendations) {
            const recommendations = bestPracticesData.recommendations;
            console.log(`[BP&SEC] 💾 Saving ${recommendations.length} recommendations...`);

            let savedRecCount = 0;
            for (const rec of recommendations) {
                try {
                    // Map severity: high/medium -> error, low -> info
                    let mappedSeverity = 'info';
                    if (rec.severity === 'high') mappedSeverity = 'error';
                    else if (rec.severity === 'medium') mappedSeverity = 'warning';
                    else if (rec.severity === 'low') mappedSeverity = 'info';

                    // Map category to allowed values
                    let mappedCategory = 'pythonic';
                    const principle = (rec.principle || '').toLowerCase();
                    if (principle.includes('pep8') || principle.includes('pep 8')) mappedCategory = 'pep8';
                    else if (principle.includes('security')) mappedCategory = 'security';
                    else if (principle.includes('performance')) mappedCategory = 'performance';
                    else if (principle.includes('anti')) mappedCategory = 'anti-pattern';

                    await BestPractice.create({
                        sessionId: historyId.toString(),
                        historyId: historyId,
                        category: mappedCategory,
                        severity: mappedSeverity,
                        line: rec.line || 1,
                        code: rec.code || originalCode.split('\n')[0] || 'N/A',
                        message: rec.description || rec.principle || 'Improvement suggestion',
                        recommendation: rec.recommendation || 'Consider improving this code',
                        goodExample: rec.example || '# Good: Follow best practices',
                        badExample: rec.badExample || rec.code || '# Current code',
                        reference: rec.reference || 'Python Best Practices',
                        applied: false
                    });
                    savedRecCount++;
                } catch (saveError) {
                    console.error('[BP&SEC] ❌ Failed to save recommendation:', saveError.message);
                }
            }
            console.log(`[BP&SEC] ✅ Saved ${savedRecCount}/${recommendations.length} recommendations to DB`);
        } else {
            console.log('[BP&SEC] ℹ️ No recommendations to save');
        }

        // 4. Save Security issues to database
        let savedSecCount = 0;
        if (securityData && securityData.issues) {
            const issues = securityData.issues;
            console.log(`[BP&SEC] 💾 Saving ${issues.length} security issues...`);

            for (const issue of issues) {
                try {
                    // Map severity: HIGH -> high, MEDIUM -> medium, LOW -> low
                    let mappedSeverity = (issue.issue_severity || 'medium').toLowerCase();
                    if (!['critical', 'high', 'medium', 'low'].includes(mappedSeverity)) {
                        mappedSeverity = 'medium';
                    }

                    await CodeRisk.create({
                        sessionId: historyId.toString(),
                        historyId: historyId,
                        category: 'security',
                        severity: mappedSeverity,
                        line: issue.line_number || 1,
                        code: issue.code || originalCode.split('\n')[(issue.line_number || 1) - 1] || 'N/A',
                        message: issue.issue_text || 'Security vulnerability detected',
                        explanation: issue.issue_text || 'This code contains a potential security vulnerability',
                        fixSuggestion: issue.more_info || 'Review and fix this security issue',
                        impact: issue.issue_confidence || 'HIGH',
                        fixed: false
                    });
                    savedSecCount++;
                } catch (saveError) {
                    console.error('[BP&SEC] ❌ Failed to save security issue:', saveError.message);
                }
            }
            console.log(`[BP&SEC] ✅ Saved ${savedSecCount}/${issues.length} security issues to DB`);
        } else {
            console.log('[BP&SEC] ℹ️ No security issues to save');
        }

        console.log('\n========================================');
        console.log('[BP&SEC] 🎉 ANALYSIS COMPLETE');
        console.log(`[BP&SEC] Summary: ${savedBPCount} BP + ${savedSecCount} Security = ${savedBPCount + savedSecCount} total saved`);
        console.log('========================================\n');
        return true;

    } catch (error) {
        console.error('[BP&SEC] Error in saveBestPracticesAndSecurity:', error.message);
        return false;
    }
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

                // Perform risk analysis (async, don't block refactoring response)
                let riskAnalysisData = null;
                try {
                    console.log('[REFACTOR] Starting risk analysis...');
                    const riskResult = await analyzeRisksDetailed(code, response.data.refactored_code, language || 'javascript');
                    if (riskResult.success) {
                        riskAnalysisData = riskResult.detailed;
                        console.log('[REFACTOR] Risk analysis completed successfully');
                        console.log('[REFACTOR] Risk Score:', riskAnalysisData.riskScore);
                        console.log('[REFACTOR] Risk Level:', riskAnalysisData.riskLevel);
                        console.log('[REFACTOR] Risk Factors:', riskAnalysisData.riskFactors?.length || 0);
                        console.log('[REFACTOR] Full risk data:', JSON.stringify(riskAnalysisData, null, 2));
                    } else {
                        console.warn('[REFACTOR] Risk analysis returned unsuccessful');
                    }
                } catch (riskError) {
                    console.warn('[REFACTOR] Risk analysis failed, continuing without it:', riskError.message);
                }

                // Prepare history data
                const historyData = {
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
                };

                // Add risk analysis if available
                if (riskAnalysisData) {
                    historyData.riskAnalysis = {
                        detailed: riskAnalysisData
                    };
                    console.log('[REFACTOR] Saving with risk analysis data');
                    console.log('[REFACTOR] riskAnalysisData.comparisonMetrics:', JSON.stringify(riskAnalysisData.comparisonMetrics, null, 2));
                    console.log('[REFACTOR] riskAnalysisData.chartData:', JSON.stringify(riskAnalysisData.chartData, null, 2));
                } else {
                    console.log('[REFACTOR] Saving without risk analysis data');
                }

                // Save to history
                const history = await RefactorHistory.create(historyData);
                console.log('[REFACTOR] History saved with ID:', history._id);
                console.log('[REFACTOR] Saved riskAnalysis structure:', JSON.stringify(history.riskAnalysis, null, 2));

                // ========== NEW: Analyze and save Best Practices & Security data ==========
                // Run these async without blocking the response
                saveBestPracticesAndSecurity(code, response.data.refactored_code, history._id, language || 'javascript')
                    .catch(err => console.error('[REFACTOR] Best practices/security save error:', err.message));

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