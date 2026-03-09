import RefactorHistory from '../../models/IT22606860/RefactorHistory.js';
import CodeRisk from '../../models/IT22606860/CodeRisk.js';
import BestPractice from '../../models/IT22606860/BestPractice.js';
import mongoose from 'mongoose';

// ============================================
// A. Refactor Summary Overview Panel
// ============================================
export const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Total refactors
        const totalRefactors = await RefactorHistory.countDocuments({ userId: userObjectId });

        // Aggregated metrics
        const metrics = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: null,
                    avgRefactorScore: { $avg: '$qualityMetrics.improvement.overallScore' },
                    avgMaintainability: { $avg: '$qualityMetrics.after.maintainabilityIndex' },
                    avgPerformanceImprovement: { $avg: '$qualityMetrics.improvement.complexityReduction' },
                    avgTechnicalDebtReduction: { $avg: '$qualityMetrics.improvement.maintainabilityImprovement' },
                    avgProcessingTime: { $avg: '$processingTime' },
                    totalAccepted: { $sum: { $cond: ['$accepted', 1, 0] } },
                    avgRating: { $avg: '$userRating' },
                    languages: { $push: '$language' },
                    riskLevels: { $push: '$riskAnalysis.after.riskScore' }
                }
            }
        ]);

        // Language distribution
        const languageStats = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Risk distribution
        const riskDistribution = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId, 'riskAnalysis.before.riskScore': { $exists: true } } },
            {
                $project: {
                    riskLevel: {
                        $cond: {
                            if: { $gte: ['$riskAnalysis.before.riskScore', 70] }, then: 'high',
                            else: {
                                $cond: {
                                    if: { $gte: ['$riskAnalysis.before.riskScore', 40] }, then: 'medium',
                                    else: 'low'
                                }
                            }
                        }
                    }
                }
            },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);

        // Model usage
        const modelStats = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: '$modelUsed', count: { $sum: 1 }, avgRating: { $avg: '$userRating' } } },
            { $sort: { count: -1 } }
        ]);

        const m = metrics[0] || {};
        const riskDist = { low: 0, medium: 0, high: 0 };
        riskDistribution.forEach(r => { riskDist[r._id] = r.count; });

        return res.json({
            success: true,
            overview: {
                totalRefactors,
                avgRefactorScore: parseFloat((m.avgRefactorScore || 0).toFixed(2)),
                avgMaintainabilityScore: parseFloat((m.avgMaintainability || 0).toFixed(2)),
                avgPerformanceImprovement: parseFloat((m.avgPerformanceImprovement || 0).toFixed(2)),
                technicalDebtReduction: parseFloat((m.avgTechnicalDebtReduction || 0).toFixed(2)),
                avgProcessingTime: Math.round(m.avgProcessingTime || 0),
                avgRating: parseFloat((m.avgRating || 0).toFixed(1)),
                mostUsedLanguage: languageStats[0]?._id || 'N/A',
                riskDistribution: riskDist,
                languageStats,
                modelStats
            }
        });
    } catch (error) {
        console.error('[DASHBOARD] Overview error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// B. Code Evolution Timeline
// ============================================
export const getEvolutionTimeline = async (req, res) => {
    try {
        const userId = req.userId;
        const { days = 90 } = req.query;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const timeline = await RefactorHistory.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $project: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    refactorScore: '$qualityMetrics.improvement.overallScore',
                    maintainability: '$qualityMetrics.after.maintainabilityIndex',
                    complexityReduction: '$qualityMetrics.improvement.complexityReduction',
                    riskScore: '$riskAnalysis.before.riskScore',
                    riskScoreAfter: '$riskAnalysis.after.riskScore',
                    language: 1,
                    instruction: 1,
                    processingTime: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Daily aggregated trends
        const dailyTrends = await RefactorHistory.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    avgScore: { $avg: '$qualityMetrics.improvement.overallScore' },
                    avgMaintainability: { $avg: '$qualityMetrics.after.maintainabilityIndex' },
                    avgRiskReduction: {
                        $avg: {
                            $subtract: [
                                { $ifNull: ['$riskAnalysis.before.riskScore', 0] },
                                { $ifNull: ['$riskAnalysis.after.riskScore', 0] }
                            ]
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.json({
            success: true,
            timeline,
            dailyTrends
        });
    } catch (error) {
        console.error('[DASHBOARD] Timeline error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// C. Previous vs Current Comparison
// ============================================
export const getSessionComparison = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const historyItem = await RefactorHistory.findOne({
            _id: sessionId,
            userId: userObjectId
        });

        if (!historyItem) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Get associated risks
        const risks = await CodeRisk.find({ historyId: historyItem._id });
        const bestPractices = await BestPractice.find({ historyId: historyItem._id });

        return res.json({
            success: true,
            comparison: {
                id: historyItem._id,
                date: historyItem.createdAt,
                language: historyItem.language,
                instruction: historyItem.instruction,
                originalCode: historyItem.originalCode,
                refactoredCode: historyItem.refactoredCode,
                qualityMetrics: historyItem.qualityMetrics,
                riskAnalysis: historyItem.riskAnalysis,
                processingTime: historyItem.processingTime,
                modelUsed: historyItem.modelUsed,
                risks,
                bestPractices
            }
        });
    } catch (error) {
        console.error('[DASHBOARD] Comparison error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// D. Performance Analytics Panel
// ============================================
export const getPerformanceAnalytics = async (req, res) => {
    try {
        const userId = req.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const performanceData = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId } },
            {
                $project: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    complexityBefore: '$qualityMetrics.before.complexity',
                    complexityAfter: '$qualityMetrics.after.complexity',
                    locBefore: '$qualityMetrics.before.loc',
                    locAfter: '$qualityMetrics.after.loc',
                    maintainabilityBefore: '$qualityMetrics.before.maintainabilityIndex',
                    maintainabilityAfter: '$qualityMetrics.after.maintainabilityIndex',
                    overallScore: '$qualityMetrics.improvement.overallScore',
                    complexityReduction: '$qualityMetrics.improvement.complexityReduction',
                    locReduction: '$qualityMetrics.improvement.locReduction',
                    riskScoreBefore: '$riskAnalysis.before.riskScore',
                    riskScoreAfter: '$riskAnalysis.after.riskScore',
                    processingTime: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Aggregate performance summary
        const summary = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: null,
                    avgComplexityReduction: { $avg: '$qualityMetrics.improvement.complexityReduction' },
                    avgLocReduction: { $avg: '$qualityMetrics.improvement.locReduction' },
                    avgMaintainabilityImprovement: { $avg: '$qualityMetrics.improvement.maintainabilityImprovement' },
                    avgOverallScore: { $avg: '$qualityMetrics.improvement.overallScore' },
                    avgComplexityBefore: { $avg: '$qualityMetrics.before.complexity' },
                    avgComplexityAfter: { $avg: '$qualityMetrics.after.complexity' },
                    avgMaintainabilityBefore: { $avg: '$qualityMetrics.before.maintainabilityIndex' },
                    avgMaintainabilityAfter: { $avg: '$qualityMetrics.after.maintainabilityIndex' }
                }
            }
        ]);

        return res.json({
            success: true,
            performance: {
                data: performanceData,
                summary: summary[0] || {}
            }
        });
    } catch (error) {
        console.error('[DASHBOARD] Performance error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// E. Risk & Security Analysis
// ============================================
export const getRiskSecurityAnalytics = async (req, res) => {
    try {
        const userId = req.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Risk trends from refactor history
        const riskTrends = await RefactorHistory.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    'riskAnalysis.before.riskScore': { $exists: true }
                }
            },
            {
                $project: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    riskBefore: '$riskAnalysis.before',
                    riskAfter: '$riskAnalysis.after',
                    risksFixed: '$riskAnalysis.risksFixed'
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Total risk stats
        const riskSummary = await RefactorHistory.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    'riskAnalysis.before.riskScore': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    totalHighRisk: {
                        $sum: {
                            $cond: [{ $gte: ['$riskAnalysis.before.riskScore', 70] }, 1, 0]
                        }
                    },
                    totalRisksFound: { $sum: '$riskAnalysis.before.totalRisks' },
                    totalRisksAfter: { $sum: '$riskAnalysis.after.totalRisks' },
                    totalRisksFixed: { $sum: '$riskAnalysis.risksFixed' },
                    avgRiskReduction: {
                        $avg: {
                            $subtract: [
                                '$riskAnalysis.before.riskScore',
                                '$riskAnalysis.after.riskScore'
                            ]
                        }
                    }
                }
            }
        ]);

        // Severity distribution
        const severityDist = await RefactorHistory.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    'riskAnalysis.before': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCritical: { $sum: '$riskAnalysis.before.critical' },
                    totalHigh: { $sum: '$riskAnalysis.before.high' },
                    totalMedium: { $sum: '$riskAnalysis.before.medium' },
                    totalLow: { $sum: '$riskAnalysis.before.low' }
                }
            }
        ]);

        return res.json({
            success: true,
            riskSecurity: {
                trends: riskTrends,
                summary: riskSummary[0] || {},
                severityDistribution: severityDist[0] || {}
            }
        });
    } catch (error) {
        console.error('[DASHBOARD] Risk error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// F. Best Practice Compliance Tracker
// ============================================
export const getBestPracticeCompliance = async (req, res) => {
    try {
        const userId = req.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Get user's refactor history IDs
        const historyIds = await RefactorHistory.find({ userId: userObjectId }).select('_id');
        const ids = historyIds.map(h => h._id);

        // Best practice violations by category
        const byCategory = await BestPractice.aggregate([
            { $match: { historyId: { $in: ids } } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: 1 },
                    applied: { $sum: { $cond: ['$applied', 1, 0] } },
                    pending: { $sum: { $cond: ['$applied', 0, 1] } }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Violations by severity
        const bySeverity = await BestPractice.aggregate([
            { $match: { historyId: { $in: ids } } },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Compliance trend over time
        const complianceTrend = await BestPractice.aggregate([
            { $match: { historyId: { $in: ids } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalViolations: { $sum: 1 },
                    applied: { $sum: { $cond: ['$applied', 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.json({
            success: true,
            bestPractices: {
                byCategory,
                bySeverity,
                complianceTrend,
                totalViolations: byCategory.reduce((sum, c) => sum + c.total, 0),
                totalApplied: byCategory.reduce((sum, c) => sum + c.applied, 0)
            }
        });
    } catch (error) {
        console.error('[DASHBOARD] Best practices error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// G. Technical Debt Tracker
// ============================================
export const getTechnicalDebtTracker = async (req, res) => {
    try {
        const userId = req.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const debtTrend = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId } },
            {
                $project: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    maintainabilityBefore: '$qualityMetrics.before.maintainabilityIndex',
                    maintainabilityAfter: '$qualityMetrics.after.maintainabilityIndex',
                    debtReduction: '$qualityMetrics.improvement.maintainabilityImprovement',
                    overallScore: '$qualityMetrics.improvement.overallScore',
                    complexityBefore: '$qualityMetrics.before.complexity',
                    complexityAfter: '$qualityMetrics.after.complexity'
                }
            },
            { $sort: { date: 1 } }
        ]);

        const debtSummary = await RefactorHistory.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: null,
                    avgDebtReduction: { $avg: '$qualityMetrics.improvement.maintainabilityImprovement' },
                    avgMaintainabilityIndex: { $avg: '$qualityMetrics.after.maintainabilityIndex' },
                    avgRefactorEfficiency: { $avg: '$qualityMetrics.improvement.overallScore' },
                    totalSessions: { $sum: 1 }
                }
            }
        ]);

        return res.json({
            success: true,
            technicalDebt: {
                trend: debtTrend,
                summary: debtSummary[0] || {}
            }
        });
    } catch (error) {
        console.error('[DASHBOARD] Technical debt error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// Developer Growth Score + Smart Recommendations
// ============================================
export const getDeveloperGrowth = async (req, res) => {
    try {
        const userId = req.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Get all user history sorted by date
        const allHistory = await RefactorHistory.find({ userId: userObjectId })
            .sort({ createdAt: 1 })
            .select('qualityMetrics riskAnalysis createdAt language instruction');

        if (allHistory.length === 0) {
            return res.json({
                success: true,
                growth: {
                    score: 0,
                    level: 'Beginner',
                    totalSessions: 0,
                    recommendations: ['Start refactoring code to track your growth!'],
                    patterns: [],
                    milestones: []
                }
            });
        }

        // Calculate growth score (0-100)
        const recentCount = Math.min(allHistory.length, 10);
        const recent = allHistory.slice(-recentCount);
        const older = allHistory.slice(0, Math.max(allHistory.length - recentCount, 1));

        const recentAvgScore = recent.reduce((sum, h) =>
            sum + (h.qualityMetrics?.improvement?.overallScore || 0), 0) / recentCount;
        const olderAvgScore = older.reduce((sum, h) =>
            sum + (h.qualityMetrics?.improvement?.overallScore || 0), 0) / older.length;

        const recentAvgRisk = recent.reduce((sum, h) =>
            sum + (h.riskAnalysis?.after?.riskScore || 50), 0) / recentCount;
        const recentAvgMaint = recent.reduce((sum, h) =>
            sum + (h.qualityMetrics?.after?.maintainabilityIndex || 50), 0) / recentCount;

        // Growth score components
        const improvementTrend = recentAvgScore > olderAvgScore ? 20 : 0;
        const qualityScore = Math.min(recentAvgScore * 0.4, 30);
        const riskAwareness = Math.max(0, (100 - recentAvgRisk) * 0.2);
        const maintScore = Math.min(recentAvgMaint * 0.2, 20);
        const consistencyScore = Math.min(allHistory.length * 2, 10);

        const growthScore = Math.min(100, Math.round(
            improvementTrend + qualityScore + riskAwareness + maintScore + consistencyScore
        ));

        // Determine level
        let level = 'Beginner';
        if (growthScore >= 80) level = 'Expert';
        else if (growthScore >= 60) level = 'Advanced';
        else if (growthScore >= 40) level = 'Intermediate';
        else if (growthScore >= 20) level = 'Developing';

        // Pattern Detection - find recurring issues
        const patterns = [];
        const lowScoreSessions = allHistory.filter(h =>
            (h.qualityMetrics?.improvement?.overallScore || 0) < 30);
        if (lowScoreSessions.length > allHistory.length * 0.3) {
            patterns.push({
                type: 'warning',
                message: `${Math.round(lowScoreSessions.length / allHistory.length * 100)}% of your refactors have low improvement scores. Focus on deeper structural changes.`
            });
        }

        const highRiskSessions = allHistory.filter(h =>
            (h.riskAnalysis?.before?.riskScore || 0) >= 70);
        if (highRiskSessions.length >= 3) {
            patterns.push({
                type: 'warning',
                message: `You have ${highRiskSessions.length} high-risk code submissions. Prioritize security and error handling.`
            });
        }

        // Smart Recommendations
        const recommendations = [];
        if (recentAvgScore < 30) {
            recommendations.push('Focus on reducing code complexity by breaking large functions into smaller ones.');
        }
        if (recentAvgRisk > 60) {
            recommendations.push('Your recent code has high risk scores. Consider adding input validation and error handling.');
        }
        if (recentAvgMaint < 40) {
            recommendations.push('Improve maintainability by using descriptive variable names and adding documentation.');
        }
        if (allHistory.length < 5) {
            recommendations.push('Keep practicing! More refactoring sessions will help you identify improvement patterns.');
        }
        if (recentAvgScore > olderAvgScore) {
            recommendations.push('Great progress! Your refactoring quality is improving over time.');
        }
        if (recommendations.length === 0) {
            recommendations.push('Excellent work! Continue maintaining high-quality refactoring practices.');
        }

        // Milestones
        const milestones = [];
        if (allHistory.length >= 1) milestones.push({ label: 'First Refactor', achieved: true });
        if (allHistory.length >= 5) milestones.push({ label: '5 Refactors', achieved: true });
        else milestones.push({ label: '5 Refactors', achieved: false });
        if (allHistory.length >= 10) milestones.push({ label: '10 Refactors', achieved: true });
        else milestones.push({ label: '10 Refactors', achieved: false });
        if (allHistory.length >= 25) milestones.push({ label: '25 Refactors', achieved: true });
        else milestones.push({ label: '25 Refactors', achieved: false });
        if (allHistory.length >= 50) milestones.push({ label: '50 Refactors', achieved: true });
        else milestones.push({ label: '50 Refactors', achieved: false });

        const hasHighScore = allHistory.some(h =>
            (h.qualityMetrics?.improvement?.overallScore || 0) >= 80);
        milestones.push({ label: 'Score 80+', achieved: hasHighScore });

        return res.json({
            success: true,
            growth: {
                score: growthScore,
                level,
                totalSessions: allHistory.length,
                scoreBreakdown: {
                    improvementTrend: Math.round(improvementTrend),
                    qualityScore: Math.round(qualityScore),
                    riskAwareness: Math.round(riskAwareness),
                    maintainability: Math.round(maintScore),
                    consistency: Math.round(consistencyScore)
                },
                recommendations,
                patterns,
                milestones,
                recentAvgScore: parseFloat(recentAvgScore.toFixed(2)),
                olderAvgScore: parseFloat(olderAvgScore.toFixed(2))
            }
        });
    } catch (error) {
        console.error('[DASHBOARD] Growth error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
