import axios from 'axios';
import CodeRisk from '../../models/IT22606860/CodeRisk.js';
import RefactorHistory from '../../models/IT22606860/RefactorHistory.js';
import { v4 as uuidv4 } from 'uuid';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// Analyze code risks
export const analyzeRisks = async (req, res) => {
    try {
        const { code, sessionId } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        const session = sessionId || uuidv4();

        console.log(`[RISK] Analyzing risks for session: ${session}`);

        // Call Python ML service
        const response = await axios.post(`${ML_API_URL}/api/analyze-risks`, {
            code
        }, {
            timeout: 15000
        });

        if (response.data.success) {
            // Save risks to database
            const risks = response.data.risks;
            const savedRisks = [];

            for (const risk of risks) {
                const codeRisk = new CodeRisk({
                    sessionId: session,
                    category: risk.category,
                    severity: risk.severity,
                    line: risk.line,
                    code: risk.code,
                    message: risk.message,
                    explanation: risk.explanation,
                    fixSuggestion: risk.fix_suggestion,
                    impact: risk.impact
                });

                await codeRisk.save();
                savedRisks.push(codeRisk);
            }

            return res.json({
                success: true,
                sessionId: session,
                risks: risks,
                total: response.data.total,
                by_severity: response.data.by_severity,
                risk_score: response.data.risk_score,
                message: 'Risk analysis completed'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: response.data.message || 'Risk analysis failed'
            });
        }

    } catch (error) {
        console.error('[RISK] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Compare risks (before/after refactoring)
export const compareRisks = async (req, res) => {
    try {
        const { originalCode, refactoredCode, historyId } = req.body;

        if (!originalCode || !refactoredCode) {
            return res.status(400).json({
                success: false,
                message: 'Both codes are required'
            });
        }

        console.log('[RISK] Comparing risks...');

        // Analyze original code risks
        const beforeResponse = await axios.post(`${ML_API_URL}/api/analyze-risks`, {
            code: originalCode
        });

        // Analyze refactored code risks
        const afterResponse = await axios.post(`${ML_API_URL}/api/analyze-risks`, {
            code: refactoredCode
        });

        const comparison = {
            before: beforeResponse.data,
            after: afterResponse.data,
            risksFixed: beforeResponse.data.total - afterResponse.data.total,
            riskScoreReduction: beforeResponse.data.risk_score - afterResponse.data.risk_score
        };

        // Update history if provided
        if (historyId) {
            await RefactorHistory.findByIdAndUpdate(historyId, {
                riskAnalysis: {
                    before: {
                        totalRisks: beforeResponse.data.total,
                        ...beforeResponse.data.by_severity,
                        riskScore: beforeResponse.data.risk_score
                    },
                    after: {
                        totalRisks: afterResponse.data.total,
                        ...afterResponse.data.by_severity,
                        riskScore: afterResponse.data.risk_score
                    },
                    risksFixed: comparison.risksFixed
                }
            });
        }

        return res.json({
            success: true,
            comparison,
            message: 'Risk comparison completed'
        });

    } catch (error) {
        console.error('[RISK] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Get risks by session
export const getRisksBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const risks = await CodeRisk.find({ sessionId }).sort({ severity: -1, line: 1 });

        return res.json({
            success: true,
            risks,
            total: risks.length
        });

    } catch (error) {
        console.error('[RISK] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark risk as fixed
export const markRiskFixed = async (req, res) => {
    try {
        const { riskId } = req.params;

        const risk = await CodeRisk.findByIdAndUpdate(
            riskId,
            { fixed: true, fixedAt: new Date() },
            { new: true }
        );

        if (!risk) {
            return res.status(404).json({
                success: false,
                message: 'Risk not found'
            });
        }

        return res.json({
            success: true,
            risk,
            message: 'Risk marked as fixed'
        });

    } catch (error) {
        console.error('[RISK] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get risk statistics
export const getRiskStats = async (req, res) => {
    try {
        const totalRisks = await CodeRisk.countDocuments();
        const fixedRisks = await CodeRisk.countDocuments({ fixed: true });
        
        const bySeverity = await CodeRisk.aggregate([
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        const byCategory = await CodeRisk.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.json({
            success: true,
            stats: {
                total: totalRisks,
                fixed: fixedRisks,
                pending: totalRisks - fixedRisks,
                bySeverity,
                byCategory
            }
        });

    } catch (error) {
        console.error('[RISK] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};