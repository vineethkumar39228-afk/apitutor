const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Progress = require('../models/Progress');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const redisClient = require('../config/redis');

// @desc    Get user analytics and mastery stats
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // --- PIPELINE 1: Overall Accuracy & Stats ---
    const overallStats = await Progress.aggregate([
        // Step 1: Filter to only this user's progress records
        { $match: { userId: userId } },

        // Step 2: Group everything together (_id: null) and calculate totals
        {
            $group: {
                _id: null,
                totalStarted: { $sum: 1 },
                totalCompleted: { $sum: { $cond: ["$isCompleted", 1, 0] } },
                totalAttempts: { $sum: "$attempts" }
            }
        },

        // Step 3: Format the output and calculate the accuracy percentage
        {
            $project: {
                _id: 0,
                totalStarted: 1,
                totalCompleted: 1,
                totalAttempts: 1,
                // Accuracy = (Total Completed / Total Attempts) * 100
                accuracyRate: {
                    $cond: [
                        { $eq: ["$totalAttempts", 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ["$totalCompleted", "$totalAttempts"] }, 100] }, 1] }
                    ]
                }
            }
        }
    ]);

    // --- PIPELINE 2: Topic Mastery ---
    const topicMastery = await Progress.aggregate([
        // Step 1: Filter to this user
        { $match: { userId: userId } },

        // Step 2: Join with the Problems collection to get the "topic" field
        // Note: 'problems' is the lowercase, pluralized name of the Problem model in MongoDB
        {
            $lookup: {
                from: 'problems',
                localField: 'problemId',
                foreignField: '_id',
                as: 'problemDetails'
            }
        },

        // Step 3: Deconstruct the array created by $lookup
        { $unwind: '$problemDetails' },

        // Step 4: Group the records by the topic name
        {
            $group: {
                _id: '$problemDetails.topic',
                problemsStarted: { $sum: 1 },
                problemsCompleted: { $sum: { $cond: ["$isCompleted", 1, 0] } },
                totalAttempts: { $sum: "$attempts" }
            }
        },

        // Step 5: Project the mastery metrics
        {
            $project: {
                topic: '$_id',
                _id: 0,
                problemsStarted: 1,
                problemsCompleted: 1,
                // Mastery Score = (Completed / Started) * 100
                masteryScore: {
                    $cond: [
                        { $eq: ["$problemsStarted", 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ["$problemsCompleted", "$problemsStarted"] }, 100] }, 0] }
                    ]
                },
                // Calculate average attempts it takes them to solve a problem in this topic
                avgAttemptsPerProblem: {
                    $cond: [
                        { $eq: ["$problemsStarted", 0] },
                        0,
                        { $round: [{ $divide: ["$totalAttempts", "$problemsStarted"] }, 1] }
                    ]
                }
            }
        },

        // Step 6: Sort by mastery score descending (best topics first)
        { $sort: { masteryScore: -1 } }
    ]);

    // Send both metrics back to the frontend
    res.status(200).json({
        success: true,
        overall: overallStats[0] || { totalStarted: 0, totalCompleted: 0, totalAttempts: 0, accuracyRate: 0 },
        mastery: topicMastery
    });
}));

// @desc    Get the global leaderboard (Top 10 users by completed problems)
// @route   GET /api/analytics/leaderboard
// @access  Public or Private
router.get('/leaderboard', asyncHandler(async (req, res) => {
    const cacheKey = 'global_leaderboard';

    // 1. Check Redis first
    let cachedLeaderboard;
    try {
        if (redisClient.isOpen) {
            cachedLeaderboard = await redisClient.get(cacheKey);
        }
    } catch (err) {
        console.error('Redis Error:', err.message);
    }

    if (cachedLeaderboard) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            leaderboard: JSON.parse(cachedLeaderboard)
        });
    }

    // 2. Cache Miss: Run the heavy MongoDB Aggregation
    const leaderboard = await Progress.aggregate([
        // Only count completed problems
        { $match: { isCompleted: true } },

        // Group by user and sum up their completed problems
        {
            $group: {
                _id: '$userId',
                totalSolved: { $sum: 1 }
            }
        },

        // Join with the User collection to get their names
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },

        // Format the output
        {
            $project: {
                _id: 0,
                userId: '$_id',
                name: '$userDetails.name',
                totalSolved: 1
            }
        },

        // Sort descending by total solved, limit to top 10
        { $sort: { totalSolved: -1 } },
        { $limit: 10 }
    ]);

    // 3. Cache the calculated leaderboard in Redis for 300 seconds (5 minutes)
    try {
        if (redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 300, JSON.stringify(leaderboard));
        }
    } catch (err) {
        console.error('Redis Error:', err.message);
    }

    res.status(200).json({
        success: true,
        source: 'database',
        leaderboard
    });
}));

module.exports = router;
