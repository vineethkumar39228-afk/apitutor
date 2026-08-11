const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const generateTokens = require('../utils/generateTokens');

const setRefreshCookie = (res, refreshToken) => {
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }
        const cleanEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: cleanEmail });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name: name.trim(), email: cleanEmail, password });
        if (user) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            setRefreshCookie(res, refreshToken);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: accessToken
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (user && (await user.matchPassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            setRefreshCookie(res, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: accessToken
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @desc    Refresh access token
// @route   POST /api/users/refresh
// @access  Public
router.post('/refresh', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized. No refresh token found.' });
    }

    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_even_more_secret_refresh_key_here', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden. Refresh token expired.' });
        }

        const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
            { expiresIn: '15m' }
        );

        res.json({ token: accessToken });
    });
});

// @desc    Logout user and clear cookie
// @route   POST /api/users/logout
// @access  Public
router.post('/logout', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
