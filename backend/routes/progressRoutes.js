const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const User = require('../models/User');
const redisClient = require('../config/redis');
// Assuming you have a middleware that verifies JWTs and sets req.user
const protect = require('../middleware/authMiddleware');
const Joi = require('joi'); // Request validation

const progressSchema = Joi.object({
    problemId: Joi.string().required()
});

// Points awarded by difficulty
const POINTS_MAP = { 'Easy': 5, 'Medium': 10, 'Hard': 20 };

// @desc    Log a new attempt on a problem
// @route   POST /api/progress/attempt
// @access  Private
router.post('/attempt', protect, asyncHandler(async (req, res) => {
    const { error, value } = progressSchema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(`Validation Error: ${error.details[0].message}`);
    }
    const { problemId } = value;
    const userId = req.user._id;

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
    const { error, value } = progressSchema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(`Validation Error: ${error.details[0].message}`);
    }
    const { problemId } = value;
    const userId = req.user._id;

    // Check if already completed to prevent duplicate scoring
    const existing = await Progress.findOne({ userId, problemId });
    if (existing && existing.isCompleted) {
        return res.status(200).json({
            success: true,
            message: 'Problem already completed.',
            progress: existing
        });
    }

    // Look up problem difficulty to calculate points
    const problem = await Problem.findById(problemId).select('difficulty');
    const points = POINTS_MAP[problem?.difficulty] || 10;

    // Set isCompleted to true, log the timestamp, and record points earned.
    const progress = await Progress.findOneAndUpdate(
        { userId, problemId },
        {
            $set: {
                isCompleted: true,
                completedAt: new Date(),
                pointsEarned: points
            },
            // If for some reason this is the first API hit, initialize attempts
            $setOnInsert: { attempts: 1 }
        },
        { new: true, upsert: true }
    );

    // Redis Leaderboard Write Path: Increment user's score in the sorted set
    try {
        if (redisClient.isOpen) {
            await redisClient.zIncrBy('leaderboard', points, userId.toString());
            // Invalidate cached leaderboard so next read fetches fresh data
            await redisClient.del('global_leaderboard');
        }
    } catch (err) {
        console.error('Redis Leaderboard Write Error:', err.message);
        // Non-blocking: don't fail the request if Redis is down
    }

    res.status(200).json({
        success: true,
        message: `Problem completed! +${points} points earned.`,
        progress
    });
}));

// @desc    Get real-time leaderboard from Redis sorted set
// @route   GET /api/progress/leaderboard
// @access  Public
router.get('/leaderboard', asyncHandler(async (req, res) => {
    let topUsers = [];

    // Try Redis first for real-time data
    try {
        if (redisClient.isOpen) {
            const redisData = await redisClient.zRangeWithScores('leaderboard', 0, 9, { REV: true });

            if (redisData && redisData.length > 0) {
                // Resolve user IDs to names via MongoDB
                const userIds = redisData.map(entry => entry.value);
                const users = await User.find({ _id: { $in: userIds } }).select('name');
                const userMap = {};
                users.forEach(u => { userMap[u._id.toString()] = u.name; });

                topUsers = redisData.map((entry, index) => ({
                    rank: index + 1,
                    userId: entry.value,
                    name: userMap[entry.value] || 'Unknown User',
                    totalScore: entry.score
                }));

                return res.status(200).json({
                    success: true,
                    source: 'redis',
                    leaderboard: topUsers
                });
            }
        }
    } catch (err) {
        console.error('Redis Leaderboard Read Error:', err.message);
    }

    // Fallback: Compute from MongoDB if Redis is empty/down
    topUsers = await Progress.aggregate([
        { $match: { isCompleted: true } },
        { $group: { _id: '$userId', totalScore: { $sum: '$pointsEarned' }, totalSolved: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
        { $unwind: '$userDetails' },
        { $project: { _id: 0, userId: '$_id', name: '$userDetails.name', totalScore: 1, totalSolved: 1 } },
        { $sort: { totalScore: -1 } },
        { $limit: 10 }
    ]);

    res.status(200).json({
        success: true,
        source: 'database',
        leaderboard: topUsers
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

