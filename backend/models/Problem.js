const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    originalEquation: { type: String, required: true },
    expectedSteps: [{ type: String, required: true }],
    hints: [{ type: String }],
    topic: { type: String, required: true, default: 'General Math' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

// --- Add Indexes ---

// 1. Single-field indexes for dropdown filters
problemSchema.index({ topic: 1 });
problemSchema.index({ difficulty: 1 });

// 2. Compound Text Index for the Search Bar
problemSchema.index({ title: 'text', originalEquation: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
