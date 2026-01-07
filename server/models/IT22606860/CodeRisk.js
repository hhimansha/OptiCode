import mongoose from 'mongoose';

const codeRiskSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    historyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RefactorHistory'
    },
    category: {
        type: String,
        enum: ['security', 'performance', 'maintainability', 'bug'],
        required: true
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        required: true
    },
    line: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    fixSuggestion: {
        type: String,
        required: true
    },
    impact: {
        type: String,
        required: true
    },
    fixed: {
        type: Boolean,
        default: false
    },
    fixedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
codeRiskSchema.index({ sessionId: 1, severity: 1 });
codeRiskSchema.index({ category: 1, fixed: 1 });

export default mongoose.model('CodeRisk', codeRiskSchema);