import RefactorHistory from '../../models/IT22606860/RefactorHistory.js';
import mongoose from 'mongoose';

// Helper to compute basic quality metrics
const computeBasicMetrics = (code) => {
    if (!code) return { loc: 0, complexity: 1, maintainabilityIndex: 50 };
    const lines = code.split('\n');
    const loc = lines.length;
    const complexityKeywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'catch', 'switch', 'case', '&&', '||', 'and', 'or'];
    let complexity = 1;
    complexityKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        const matches = code.match(regex);
        if (matches) complexity += matches.length;
    });
    const maintainabilityIndex = Math.max(0, Math.min(100,
        171 - 5.2 * Math.log(Math.max(1, complexity)) - 0.23 * complexity - 16.2 * Math.log(Math.max(1, loc))
    ));
    return { loc, complexity, maintainabilityIndex: parseFloat(maintainabilityIndex.toFixed(2)) };
};

// Create new history entry
export const createHistory = async (req, res, next) => {
    try {
        const { 
            originalCode, 
            refactoredCode, 
            language = 'python',
            instruction = 'Unified comprehensive refactoring',
            modelUsed = 'ast',
            processingTime = 0,
            changesApplied = [],
            summary = {}
        } = req.body;

        if (!originalCode || !refactoredCode) {
            return res.status(400).json({
                success: false,
                message: 'Both originalCode and refactoredCode are required'
            });
        }

        // Compute quality metrics
        const beforeMetrics = computeBasicMetrics(originalCode);
        const afterMetrics = computeBasicMetrics(refactoredCode);
        const improvement = {
            locReduction: parseFloat(((beforeMetrics.loc - afterMetrics.loc) / Math.max(beforeMetrics.loc, 1) * 100).toFixed(2)),
            complexityReduction: parseFloat(((beforeMetrics.complexity - afterMetrics.complexity) / Math.max(beforeMetrics.complexity, 1) * 100).toFixed(2)),
            maintainabilityImprovement: parseFloat((afterMetrics.maintainabilityIndex - beforeMetrics.maintainabilityIndex).toFixed(2)),
            overallScore: parseFloat((((afterMetrics.maintainabilityIndex - beforeMetrics.maintainabilityIndex) + ((beforeMetrics.complexity - afterMetrics.complexity) / Math.max(beforeMetrics.complexity, 1) * 100)) / 2).toFixed(2))
        };

        const history = await RefactorHistory.create({
            userId: req.userId || null,
            inputCode: originalCode,
            originalCode: originalCode,
            refactoredCode: refactoredCode,
            language: language,
            instruction: instruction,
            modelUsed: modelUsed,
            processingTime: processingTime,
            status: 'completed',
            qualityMetrics: {
                before: beforeMetrics,
                after: afterMetrics,
                improvement
            },
            changesApplied: changesApplied,
            summary: summary
        });

        console.log(`[HISTORY] Created history entry: ${history._id}`);

        res.status(201).json({
            success: true,
            data: history,
            historyId: history._id,
            message: 'History saved successfully'
        });
    } catch (error) {
        console.error('[HISTORY CREATE] Error:', error.message);
        next(error);
    }
};

// Get refactoring history with pagination
export const getHistory = async (req, res, next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            modelUsed, 
            sortBy = 'createdAt' 
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query - scope to authenticated user
        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }
        if (modelUsed) {
            query.modelUsed = modelUsed;
        }

        // Get history with pagination - include inputCode for preview
        const history = await RefactorHistory.find(query)
            .sort({ [sortBy]: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('instruction language modelUsed processingTime status createdAt qualityMetrics riskAnalysis changesApplied inputCode refactoredCode'); // Include code for display

        const total = await RefactorHistory.countDocuments(query);

        res.status(200).json({
            success: true,
            data: history,
            history: history, // For backward compatibility
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Get single history item by ID
export const getHistoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const historyItem = await RefactorHistory.findById(id);

        if (!historyItem) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: historyItem,
            history: historyItem // For backward compatibility
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Update history item (for renaming instruction, adding risk analysis, etc.)
export const updateHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { instruction, riskAnalysis, userRating, userFeedback, accepted } = req.body;

        const updateData = {};
        if (instruction !== undefined) updateData.instruction = instruction;
        if (riskAnalysis !== undefined) updateData.riskAnalysis = riskAnalysis;
        if (userRating !== undefined) updateData.userRating = userRating;
        if (userFeedback !== undefined) updateData.userFeedback = userFeedback;
        if (accepted !== undefined) updateData.accepted = accepted;

        const updated = await RefactorHistory.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        console.log(`[HISTORY] Updated history entry: ${id}`);

        res.status(200).json({
            success: true,
            data: updated,
            message: 'History updated successfully'
        });
    } catch (error) {
        console.error('[HISTORY UPDATE] Error:', error.message);
        next(error);
    }
};

// Delete a history item
export const deleteHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await RefactorHistory.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'History item deleted successfully'
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Clear all history
export const clearAllHistory = async (req, res, next) => {
    try {
        // Build query - only delete user's own history if authenticated
        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        const result = await RefactorHistory.deleteMany(query);

        res.status(200).json({
            success: true,
            message: req.user 
                ? `Deleted ${result.deletedCount} history items`
                : 'All history cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Get history statistics
export const getHistoryStats = async (req, res, next) => {
    try {
        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        const stats = await RefactorHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRefactorings: { $sum: 1 },
                    avgProcessingTime: { $avg: '$processingTime' },
                    totalProcessingTime: { $sum: '$processingTime' },
                    byModel: {
                        $push: '$modelUsed'
                    },
                    byLanguage: {
                        $push: '$language'
                    },
                    avgRating: { $avg: '$userRating' },
                    acceptedCount: {
                        $sum: { $cond: ['$accepted', 1, 0] }
                    }
                }
            }
        ]);

        // Count by model
        const modelCounts = {};
        if (stats.length > 0 && stats[0].byModel) {
            stats[0].byModel.forEach(model => {
                if (model) {
                    modelCounts[model] = (modelCounts[model] || 0) + 1;
                }
            });
        }

        // Count by language
        const languageCounts = {};
        if (stats.length > 0 && stats[0].byLanguage) {
            stats[0].byLanguage.forEach(lang => {
                if (lang) {
                    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
                }
            });
        }

        res.status(200).json({
            success: true,
            stats: stats.length > 0 ? {
                totalRefactorings: stats[0].totalRefactorings,
                avgProcessingTime: Math.round(stats[0].avgProcessingTime || 0),
                totalProcessingTime: stats[0].totalProcessingTime,
                avgRating: stats[0].avgRating ? stats[0].avgRating.toFixed(2) : null,
                acceptedCount: stats[0].acceptedCount,
                acceptanceRate: stats[0].totalRefactorings > 0 
                    ? ((stats[0].acceptedCount / stats[0].totalRefactorings) * 100).toFixed(2) 
                    : 0,
                modelCounts,
                languageCounts
            } : {
                totalRefactorings: 0,
                avgProcessingTime: 0,
                totalProcessingTime: 0,
                avgRating: null,
                acceptedCount: 0,
                acceptanceRate: 0,
                modelCounts: {},
                languageCounts: {}
            }
        });
    } catch (error) {
        console.error('[HISTORY STATS] Error:', error.message);
        next(error);
    }
};

// Get recent history (last N items)
export const getRecentHistory = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;
        const limitNum = parseInt(limit);

        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        const recent = await RefactorHistory.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .select('instruction language modelUsed processingTime userRating createdAt');

        res.status(200).json({
            success: true,
            data: recent
        });
    } catch (error) {
        console.error('[RECENT HISTORY] Error:', error.message);
        next(error);
    }
};

// Search history
export const searchHistory = async (req, res, next) => {
    try {
        const { 
            query: searchQuery, 
            language, 
            modelUsed, 
            page = 1, 
            limit = 10 
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = {};
        
        // User filter
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        // Search in instruction or code
        if (searchQuery) {
            query.$or = [
                { instruction: { $regex: searchQuery, $options: 'i' } },
                { originalCode: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Filter by language
        if (language) {
            query.language = language;
        }

        // Filter by model
        if (modelUsed) {
            query.modelUsed = modelUsed;
        }

        const results = await RefactorHistory.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('-originalCode -refactoredCode');

        const total = await RefactorHistory.countDocuments(query);

        res.status(200).json({
            success: true,
            data: results,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('[SEARCH HISTORY] Error:', error.message);
        next(error);
    }
};