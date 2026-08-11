const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateTokens = require('../utils/generateTokens');
const router = express.Router();

const setRefreshCookie = (res, refreshToken) => {
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

// @route POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
    let { name, email, password } = req.body;
    if (!email || !password || !name) {
        res.status(400);
        throw new Error('Please provide name, email, and password');
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
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
        res.status(400);
        throw new Error('Invalid user data');
    }
}));

// @route POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
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
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));

// @route POST /api/auth/refresh
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

// @route POST /api/auth/logout
router.post('/logout', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;