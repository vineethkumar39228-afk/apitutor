const mongoose = require('mongoose');

// Schema for individual logical steps
const stepSchema = new mongoose.Schema({
    stepNumber: { type: Number, required: true },
    instruction: { type: String, required: true },
    formula: { type: String }
});

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    originalEquation: { type: String, required: true },
    expectedSteps: [stepSchema],
    hints: [{ type: String }],
    topic: {
        type: String,
        required: true,
        default: 'General Math',
        enum: [
            'General Math', 'Algebra', 'Calculus', 'Fractions',
            'Percentages', 'Time & Work', 'Probability',
            'Geometry', 'Number Systems', 'Data Interpretation'
        ]
    },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    videoUrl: {
        type: String,
        trim: true,
        // Store YouTube Video ID only (e.g., "dQw4w9WgXcQ") for lightweight embedding
    }
}, { timestamps: true });

// --- Add Indexes ---

// 1. Single-field indexes for dropdown filters
problemSchema.index({ topic: 1 });
problemSchema.index({ difficulty: 1 });

// 2. Compound Text Index for the Search Bar
problemSchema.index({ title: 'text', originalEquation: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
