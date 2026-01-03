import mongoose from 'mongoose';

const bestPracticeSchema = new mongoose.Schema({
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
        enum: ['pep8', 'pythonic', 'anti-pattern', 'performance', 'security'],
        required: true
    },
    severity: {
        type: String,
        enum: ['error', 'warning', 'info'],
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
    recommendation: {
        type: String,
        required: true
    },
    goodExample: {
        type: String,
        required: true
    },
    badExample: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    applied: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
bestPracticeSchema.index({ sessionId: 1, category: 1 });
bestPracticeSchema.index({ severity: 1, applied: 1 });

export default mongoose.model('BestPractice', bestPracticeSchema);