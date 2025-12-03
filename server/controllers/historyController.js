import RefactorHistory from '../models/RefactorHistory.js';

// Get refactoring history with pagination
export const getHistory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await RefactorHistory.countDocuments();
        const history = await RefactorHistory.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
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
            data: historyItem
        });
    } catch (error) {
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
        next(error);
    }
};

// Clear all history
export const clearAllHistory = async (req, res, next) => {
    try {
        await RefactorHistory.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'All history cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};
