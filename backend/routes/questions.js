const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const Problem = require('../models/Problem');
const redisClient = require('../config/redis');

// @desc    Get all problems with filtering, search, and pagination
// @route   GET /api/questions
// @access  Public or Private
router.get('/', asyncHandler(async (req, res) => {
    // 1. Extract query parameters from the request
    const { topic, difficulty, search, page = 1, limit = 10 } = req.query;

    // 2. Build the dynamic MongoDB query object
    const query = {};

    // Exact or case-insensitive match for topic and difficulty
    if (topic) {
        query.topic = new RegExp(`^${topic}$`, 'i');
    }

    if (difficulty) {
        query.difficulty = new RegExp(`^${difficulty}$`, 'i');
    }

    // Text search on both title and the equation itself
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { originalEquation: { $regex: search, $options: 'i' } }
        ];
    }

    // 3. Construct a unique Redis cache key based on the exact query parameters
    // e.g., "questions:{"topic":"algebra","difficulty":"hard","page":1,"limit":10}"
    const cacheKey = `questions:${JSON.stringify(req.query)}`;

    // 4. Check Redis Cache
    let cachedData;
    try {
        if (redisClient.isOpen) {
            cachedData = await redisClient.get(cacheKey);
        }
    } catch (err) {
        console.error('Redis Error:', err.message);
    }

    if (cachedData) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            ...JSON.parse(cachedData)
        });
    }

    // 5. Cache Miss: Execute the database query with pagination
    const skip = (page - 1) * limit;

    // Run the query and the count document function in parallel
    const [questions, total] = await Promise.all([
        Problem.find(query)
            .select('-expectedSteps -hints') // Exclude answers to prevent cheating
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 }), // Newest first
        Problem.countDocuments(query)
    ]);

    // 6. Format the response data
    const responseData = {
        data: questions,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            limit: Number(limit)
        }
    };

    // 7. Store in Redis (Cache for 30 minutes)
    try {
        if (redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
        }
    } catch (err) {
        console.error('Redis Error:', err.message);
    }

    res.status(200).json({
        success: true,
        source: 'database',
        ...responseData
    });
}));

// @desc    Fetch a single question by ID
// @route   GET /api/questions/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const question = await Problem.findById(req.params.id);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }
    res.json(question);
}));

module.exports = router;