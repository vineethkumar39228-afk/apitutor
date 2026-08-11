const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const Progress = require('../models/Progress');
// Assuming you have a middleware that verifies JWTs and sets req.user
const protect = require('../middleware/authMiddleware');

// @desc    Log a new attempt on a problem
// @route   POST /api/progress/attempt
// @access  Private
router.post('/attempt', protect, asyncHandler(async (req, res) => {
    const { problemId } = req.body;
    const userId = req.user._id;

    if (!problemId) {
        res.status(400);
        throw new Error('Problem ID is required.');
    }

    // Increment the attempts counter by 1. 
    // If no document exists for this user/problem, it creates one.
    const progress = await Progress.findOneAndUpdate(
        { userId, problemId },
        { $inc: { attempts: 1 } },
        { new: true, upsert: true }
    );

    res.status(200).json({
        success: true,
        progress
    });
}));

// @desc    Mark a problem as successfully completed
// @route   POST /api/progress/complete
// @access  Private
router.post('/complete', protect, asyncHandler(async (req, res) => {
    const { problemId } = req.body;
    const userId = req.user._id;

    if (!problemId) {
        res.status(400);
        throw new Error('Problem ID is required.');
    }

    // Set isCompleted to true and log the timestamp.
    const progress = await Progress.findOneAndUpdate(
        { userId, problemId },
        {
            $set: {
                isCompleted: true,
                completedAt: new Date()
            },
            // If for some reason this is the first API hit, initialize attempts
            $setOnInsert: { attempts: 1 }
        },
        { new: true, upsert: true }
    );

    res.status(200).json({
        success: true,
        message: 'Problem marked as completed!',
        progress
    });
}));

// @desc    Get user's progress for a specific problem (Useful for loading UI state)
// @route   GET /api/progress/:problemId
// @access  Private
router.get('/:problemId', protect, asyncHandler(async (req, res) => {
    const progress = await Progress.findOne({
        userId: req.user._id,
        problemId: req.params.problemId
    });

    if (!progress) {
        return res.status(200).json({ success: true, progress: null });
    }

    res.status(200).json({ success: true, progress });
}));

module.exports = router;
