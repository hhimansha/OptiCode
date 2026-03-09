import mongoose from 'mongoose';

const RefactorHistorySchema = new mongoose.Schema({
    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for demo mode
    },
    
    // Code Information
    inputCode: {
        type: String,
        required: true
    },
    originalCode: {
        type: String,
        required: true
    },
    refactoredCode: {
        type: String,
        required: true
    },
    
    // Language and Instructions
    language: {
        type: String,
        required: true,
        default: 'javascript'
    },
    instruction: {
        type: String,
        required: true,
        default: 'Refactor this code'
    },
    
    // Processing Information
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    modelUsed: {
        type: String,
        enum: ['trained', 'huggingface', 'rules', 'ensemble', 'ast', 'hybrid', 'ml', 'llm'],
        default: 'ast'
    },
    processingTime: {
        type: Number, // in milliseconds
        required: true,
        default: 0
    },
    
    // Quality Metrics
    qualityMetrics: {
        before: {
            loc: Number,
            complexity: Number,
            maintainabilityIndex: Number
        },
        after: {
            loc: Number,
            complexity: Number,
            maintainabilityIndex: Number
        },
        improvement: {
            locReduction: Number,
            complexityReduction: Number,
            maintainabilityImprovement: Number,
            overallScore: Number
        }
    },
    
    // Risk Analysis - Extended with detailed information
    riskAnalysis: {
        // Original risk counts (before/after)
        before: {
            totalRisks: Number,
            critical: Number,
            high: Number,
            medium: Number,
            low: Number,
            riskScore: Number
        },
        after: {
            totalRisks: Number,
            critical: Number,
            high: Number,
            medium: Number,
            low: Number,
            riskScore: Number
        },
        risksFixed: Number,
        
        // Detailed AI-powered risk assessment
        detailed: {
            riskScore: Number,         // 0-100 overall risk score
            riskLevel: String,         // 'low', 'medium', 'high'
            riskColor: String,         // Color code for UI
            explanation: String,       // Detailed explanation of risk assessment
            recommendation: String,    // Recommendation text
            processingTime: Number,    // Time taken for analysis in ms
            
            // Individual risk factors with scores
            riskFactors: [{
                factor: String,        // e.g., 'Side effects', 'Performance'
                score: Number,         // 0-100 score for this factor
                description: String    // Description of the risk factor
            }],
            
            // Suggestions for improvement
            suggestions: [String],
            
            // Potential issues identified
            potentialIssues: [String],
            
            // Side effects to watch for
            sideEffects: [String],
            
            // Code comparison metrics
            comparisonMetrics: {
                lineCount: {
                    original: Number,
                    refactored: Number,
                    change: Number
                },
                characterCount: {
                    original: Number,
                    refactored: Number,
                    change: Number
                },
                complexity: {
                    originalLoops: Number,
                    refactoredLoops: Number,
                    originalConditionals: Number,
                    refactoredConditionals: Number,
                    originalNesting: Number,
                    refactoredNesting: Number
                },
                readabilityScore: {
                    original: Number,
                    refactored: Number
                }
            },
            
            // Chart data for visualization
            chartData: {
                gaugeChart: [mongoose.Schema.Types.Mixed],
                pieChart: [mongoose.Schema.Types.Mixed],
                barChart: [mongoose.Schema.Types.Mixed]
            }
        }
    },
    
    // User Feedback
    userRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    userFeedback: {
        type: String,
        default: ''
    },
    accepted: {
        type: Boolean,
        default: null
    },
    
    // Execution Results
    executionResults: {
        inputCode: {
            output: String,
            error: String,
            executionTime: Number
        },
        refactoredCode: {
            output: String,
            error: String,
            executionTime: Number
        },
        testsPassed: Boolean
    },
    
    // Changes Applied (from AST refactoring)
    changesApplied: [{
        type: String
    }],
    
    // Refactoring Summary
    summary: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    minimize: false
});

// Indexes for faster queries
RefactorHistorySchema.index({ userId: 1, createdAt: -1 });
RefactorHistorySchema.index({ modelUsed: 1 });
RefactorHistorySchema.index({ 'qualityMetrics.improvement.overallScore': -1 });

const RefactorHistory = mongoose.models.RefactorHistory || mongoose.model('RefactorHistory', RefactorHistorySchema);

export default RefactorHistory;