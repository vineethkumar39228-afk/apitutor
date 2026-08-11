const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Prevent duplicate progress records for the same user-problem combination
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

// --- Add Indexes for Aggregations ---

// Index for the Leaderboard (which filters by isCompleted: true)
progressSchema.index({ isCompleted: 1 });

// Index for the User Dashboard (which filters by userId)
progressSchema.index({ userId: 1 });

module.exports = mongoose.model('Progress', progressSchema);
