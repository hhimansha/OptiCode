import RefactorHistory from '../../models/IT22606860/RefactorHistory.js';
import CodeRisk from '../../models/IT22606860/CodeRisk.js';
import BestPractice from '../../models/IT22606860/BestPractice.js';
import Analytics from '../../models/IT22606860/Analytics.js';

// Get overall analytics dashboard
export const getDashboard = async (req, res) => {
    try {
        // Total refactorings
        const totalRefactorings = await RefactorHistory.countDocuments();

        // Average quality improvement
        const qualityStats = await RefactorHistory.aggregate([
            {
                $match: {
                    'qualityMetrics.improvement.overallScore': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    avgImprovement: { $avg: '$qualityMetrics.improvement.overallScore' },
                    avgProcessingTime: { $avg: '$processingTime' }
                }
            }
        ]);

        // Total risks found and fixed
        const totalRisks = await CodeRisk.countDocuments();
        const fixedRisks = await CodeRisk.countDocuments({ fixed: true });

        // Model usage stats
        const modelStats = await RefactorHistory.aggregate([
            {
                $group: {
                    _id: '$modelUsed',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$userRating' }
                }
            }
        ]);

        // User satisfaction
        const satisfactionStats = await RefactorHistory.aggregate([
            {
                $match: {
                    userRating: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$userRating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = await RefactorHistory.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        return res.json({
            success: true,
            dashboard: {
                totalRefactorings,
                avgQualityImprovement: qualityStats[0]?.avgImprovement || 0,
                avgProcessingTime: qualityStats[0]?.avgProcessingTime || 0,
                totalRisks,
                fixedRisks,
                riskFixRate: totalRisks > 0 ? (fixedRisks / totalRisks * 100) : 0,
                modelStats,
                avgUserRating: satisfactionStats[0]?.avgRating || 0,
                totalRatings: satisfactionStats[0]?.totalRatings || 0,
                recentActivity
            }
        });

    } catch (error) {
        console.error('[ANALYTICS] Dashboard error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get quality trends over time
export const getQualityTrends = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const trends = await RefactorHistory.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    'qualityMetrics.improvement.overallScore': { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    avgImprovement: { $avg: '$qualityMetrics.improvement.overallScore' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return res.json({
            success: true,
            trends
        });

    } catch (error) {
        console.error('[ANALYTICS] Trends error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get model comparison analytics
export const getModelComparison = async (req, res) => {
    try {
        const comparison = await RefactorHistory.aggregate([
            {
                $group: {
                    _id: '$modelUsed',
                    totalUses: { $sum: 1 },
                    avgProcessingTime: { $avg: '$processingTime' },
                    avgQuality: { $avg: '$qualityMetrics.improvement.overallScore' },
                    avgRating: { $avg: '$userRating' },
                    acceptanceRate: {
                        $avg: {
                            $cond: [{ $eq: ['$accepted', true] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { avgQuality: -1 }
            }
        ]);

        return res.json({
            success: true,
            comparison
        });

    } catch (error) {
        console.error('[ANALYTICS] Model comparison error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get top refactorings (highest quality improvements)
export const getTopRefactorings = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topRefactorings = await RefactorHistory.find({
            'qualityMetrics.improvement.overallScore': { $exists: true }
        })
        .sort({ 'qualityMetrics.improvement.overallScore': -1 })
        .limit(parseInt(limit))
        .select('originalCode refactoredCode qualityMetrics modelUsed createdAt');

        return res.json({
            success: true,
            topRefactorings
        });

    } catch (error) {
        console.error('[ANALYTICS] Top refactorings error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export analytics data
export const exportAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, format = 'json' } = req.query;

        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const data = await RefactorHistory.find(query)
            .populate('userId', 'username email')
            .select('-__v');

        if (format === 'csv') {
            // Convert to CSV
            const csv = convertToCSV(data);
            res.header('Content-Type', 'text/csv');
            res.attachment('analytics.csv');
            return res.send(csv);
        }

        return res.json({
            success: true,
            data,
            total: data.length
        });

    } catch (error) {
        console.error('[ANALYTICS] Export error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to convert to CSV
function convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = ['Date', 'Model', 'Processing Time', 'Quality Score', 'User Rating'];
    const rows = data.map(item => [
        item.createdAt,
        item.modelUsed,
        item.processingTime,
        item.qualityMetrics?.improvement?.overallScore || '',
        item.userRating || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
}