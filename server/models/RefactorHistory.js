import mongoose from 'mongoose';

const RefactorHistorySchema = new mongoose.Schema({
    inputCode: {
        type: String,
        required: true
    },
    refactoredCode: {
        type: String,
        required: true
    },
    instruction: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        default: 'javascript'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    processingTime: {
        type: Number, // in milliseconds
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now
    }
}, {
    timestamps: true,
    minimize: false
});

const RefactorHistory = mongoose.models.RefactorHistory || mongoose.model('RefactorHistory', RefactorHistorySchema);

export default RefactorHistory;
