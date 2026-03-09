import mongoose from 'mongoose';

const ConceptSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    category:    {
        type: String,
        required: true,
        enum: ['data_structure', 'algorithm', 'design_pattern', 'architecture', 'paradigm', 'programming_concept', 'other'],
        default: 'programming_concept'
    },
    description: { type: String, required: true, trim: true },
    confidence:  { type: Number, min: 0, max: 1, default: 0.5 },
    evidence:    { type: String, trim: true, default: '' },
    relatedConcepts: { type: [String], default: [] }
}, { _id: false });

const MetricsSchema = new mongoose.Schema({
    linesOfCode:       { type: Number, default: 0 },
    functionsFound:    { type: Number, default: 0 },
    classesFound:      { type: Number, default: 0 },
    importsFound:      { type: Number, default: 0 },
    conceptsExtracted: { type: Number, default: 0 },
    language:          { type: String, default: 'python' }
}, { _id: false });

const ConceptExtractionSchema = new mongoose.Schema(
    {
        userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        sourceCode: { type: String, required: true },
        language:   { type: String, required: true, trim: true, lowercase: true, default: 'python' },
        concepts:   { type: [ConceptSchema], default: [] },
        metrics:    { type: MetricsSchema, default: () => ({}) },
        processingTime: { type: Number, default: 0 },
        title:      { type: String, trim: true, default: '' },
        tags:       { type: [String], default: [] },
        componentId: { type: String, default: 'IT22601360' }
    },
    { timestamps: true }
);

ConceptExtractionSchema.index({ userId: 1, createdAt: -1 });
ConceptExtractionSchema.index({ tags: 1 });
ConceptExtractionSchema.index({ language: 1 });

ConceptExtractionSchema.pre('save', function (next) {
    if (this.concepts?.length > 0) {
        this.title = this.concepts.slice(0, 3).map(c => c.name).join(' · ');
        this.tags  = [...new Set(this.concepts.map(c => c.name.toLowerCase().replace(/\s+/g, '-')))];
    }
    next();
});

export default mongoose.model('ConceptExtraction', ConceptExtractionSchema);