import RefactorHistory from '../models/RefactorHistory.js';

// Refactor code using AI (placeholder - integrate with your AI service)
export const refactorCode = async (req, res, next) => {
    try {
        const { code, instruction, language = 'javascript' } = req.body;

        if (!code || !instruction) {
            return res.status(400).json({
                success: false,
                message: 'Code and instruction are required'
            });
        }

        const startTime = Date.now();

        // TODO: Integrate with your AI service (OpenAI, Claude, etc.)
        // For now, this is a placeholder that returns the same code
        const refactoredCode = `// Refactored based on: ${instruction}\n${code}`;

        const processingTime = Date.now() - startTime;

        // Save to history
        const historyEntry = await RefactorHistory.create({
            inputCode: code,
            refactoredCode,
            instruction,
            language,
            status: 'completed',
            processingTime
        });

        res.status(200).json({
            success: true,
            data: {
                refactoredCode,
                processingTime,
                historyId: historyEntry._id
            }
        });
    } catch (error) {
        next(error);
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

        // TODO: Implement AI-based code analysis
        const suggestions = [
            'Consider using const instead of var',
            'Add error handling',
            'Improve variable naming'
        ];

        res.status(200).json({
            success: true,
            data: { suggestions }
        });
    } catch (error) {
        next(error);
    }
};
