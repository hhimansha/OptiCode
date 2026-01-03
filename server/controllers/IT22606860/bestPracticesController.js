import axios from 'axios';
import BestPractice from '../../models/IT22606860/BestPractice.js';
import { v4 as uuidv4 } from 'uuid';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// Analyze best practices
export const analyzeBestPractices = async (req, res) => {
    try {
        const { code, sessionId } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Code is required'
            });
        }

        const session = sessionId || uuidv4();

        console.log(`[BEST PRACTICES] Analyzing for session: ${session}`);

        // Call Python ML service
        const response = await axios.post(`${ML_API_URL}/api/analyze-practices`, {
            code
        }, {
            timeout: 15000
        });

        if (response.data.success) {
            // Save violations to database
            const violations = response.data.violations;
            const savedPractices = [];

            for (const violation of violations) {
                const practice = new BestPractice({
                    sessionId: session,
                    category: violation.category,
                    severity: violation.severity,
                    line: violation.line,
                    code: violation.code,
                    message: violation.message,
                    recommendation: violation.recommendation,
                    goodExample: violation.good_example,
                    badExample: violation.bad_example,
                    reference: violation.reference
                });

                await practice.save();
                savedPractices.push(practice);
            }

            return res.json({
                success: true,
                sessionId: session,
                violations: violations,
                by_severity: response.data.by_severity,
                recommendations: response.data.recommendations,
                message: 'Best practices analysis completed'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: response.data.message || 'Analysis failed'
            });
        }

    } catch (error) {
        console.error('[BEST PRACTICES] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Get practices by session
export const getPracticesBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const practices = await BestPractice.find({ sessionId })
            .sort({ severity: -1, line: 1 });

        // Group by category
        const byCategory = {};
        practices.forEach(p => {
            if (!byCategory[p.category]) {
                byCategory[p.category] = [];
            }
            byCategory[p.category].push(p);
        });

        return res.json({
            success: true,
            practices,
            byCategory,
            total: practices.length
        });

    } catch (error) {
        console.error('[BEST PRACTICES] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark practice as applied
export const markPracticeApplied = async (req, res) => {
    try {
        const { practiceId } = req.params;

        const practice = await BestPractice.findByIdAndUpdate(
            practiceId,
            { applied: true },
            { new: true }
        );

        if (!practice) {
            return res.status(404).json({
                success: false,
                message: 'Best practice not found'
            });
        }

        return res.json({
            success: true,
            practice,
            message: 'Practice marked as applied'
        });

    } catch (error) {
        console.error('[BEST PRACTICES] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get best practices statistics
export const getBestPracticesStats = async (req, res) => {
    try {
        const total = await BestPractice.countDocuments();
        const applied = await BestPractice.countDocuments({ applied: true });

        const byCategory = await BestPractice.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const bySeverity = await BestPractice.aggregate([
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.json({
            success: true,
            stats: {
                total,
                applied,
                pending: total - applied,
                byCategory,
                bySeverity
            }
        });

    } catch (error) {
        console.error('[BEST PRACTICES] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};