import mongoose from 'mongoose';

/**
 * Request validation middleware
 */
export const validateRequest = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate code length (max 50KB)
        if (req.body.code && req.body.code.length > 50000) {
            return res.status(400).json({
                success: false,
                message: 'Code exceeds maximum length of 50KB'
            });
        }

        next();
    };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
            success: false,
            message: 'Invalid page number'
        });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
            success: false,
            message: 'Invalid limit (must be between 1 and 100)'
        });
    }

    req.pagination = {
        page: pageNum,
        limit: limitNum
    };

    next();
};

/**
 * Validate session ID format
 */
export const validateSessionId = (req, res, next) => {
    const { sessionId } = req.params;

    if (!sessionId || sessionId.length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Invalid session ID'
        });
    }

    next();
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (req, res, next) => {
    const { id, historyId, riskId, practiceId } = req.params;
    const targetId = id || historyId || riskId || practiceId;
    
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    next();
};