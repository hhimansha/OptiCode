const RefactorHistory = require('../models/RefactorHistory');

class MetricsService {
    /**
     * Calculate quality score from metrics
     */
    calculateQualityScore(metrics) {
        let score = 0;

        // Maintainability Index (40 points)
        if (metrics.maintainability_index) {
            score += (metrics.maintainability_index / 100) * 40;
        }

        // Complexity (30 points - lower is better)
        if (metrics.complexity) {
            const avgComplexity = metrics.complexity.average;
            if (avgComplexity <= 5) {
                score += 30;
            } else if (avgComplexity <= 10) {
                score += 20;
            } else if (avgComplexity <= 15) {
                score += 10;
            }
        }

        // LOC efficiency (15 points)
        if (metrics.loc && metrics.functions_count && metrics.functions_count > 0) {
            const locPerFunc = metrics.loc / metrics.functions_count;
            if (locPerFunc <= 20) {
                score += 15;
            } else if (locPerFunc <= 50) {
                score += 10;
            } else if (locPerFunc <= 100) {
                score += 5;
            }
        }

        // Comments ratio (15 points)
        if (metrics.loc && metrics.comments && metrics.loc > 0) {
            const commentRatio = metrics.comments / metrics.loc;
            score += Math.min(15, commentRatio * 100);
        }

        return Math.round(Math.min(100, score));
    }

    /**
     * Calculate improvement percentage
     */
    calculateImprovement(before, after) {
        const beforeScore = this.calculateQualityScore(before);
        const afterScore = this.calculateQualityScore(after);

        return {
            before: beforeScore,
            after: afterScore,
            improvement: afterScore - beforeScore,
            improvementPercentage: beforeScore > 0 
                ? Math.round(((afterScore - beforeScore) / beforeScore) * 100) 
                : 0
        };
    }

    /**
     * Get metrics summary for multiple refactorings
     */
    async getMetricsSummary(userId = null) {
        const query = userId ? { userId } : {};

        const summary = await RefactorHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    avgLocReduction: { 
                        $avg: '$qualityMetrics.improvement.locReduction' 
                    },
                    avgComplexityReduction: { 
                        $avg: '$qualityMetrics.improvement.complexityReduction' 
                    },
                    avgMaintainabilityImprovement: { 
                        $avg: '$qualityMetrics.improvement.maintainabilityImprovement' 
                    },
                    avgOverallScore: { 
                        $avg: '$qualityMetrics.improvement.overallScore' 
                    },
                    totalRefactorings: { $sum: 1 }
                }
            }
        ]);

        return summary[0] || {
            avgLocReduction: 0,
            avgComplexityReduction: 0,
            avgMaintainabilityImprovement: 0,
            avgOverallScore: 0,
            totalRefactorings: 0
        };
    }

    /**
     * Get metrics trend over time
     */
    async getMetricsTrend(days = 30, userId = null) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const query = {
            createdAt: { $gte: startDate },
            'qualityMetrics.improvement.overallScore': { $exists: true }
        };

        if (userId) {
            query.userId = userId;
        }

        const trend = await RefactorHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    avgScore: { $avg: '$qualityMetrics.improvement.overallScore' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return trend;
    }
}

module.exports = new MetricsService();