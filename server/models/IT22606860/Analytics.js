import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    metricType: {
        type: String,
        enum: ['daily', 'model_comparison', 'quality_trend', 'risk_trend', 'user_satisfaction'],
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes for time-series queries
analyticsSchema.index({ metricType: 1, date: -1 });

export default mongoose.model('Analytics', analyticsSchema);