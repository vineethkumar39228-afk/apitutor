const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
    // Access Token: Expires quickly (e.g., 15 minutes)
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
        { expiresIn: '15m' }
    );

    // Refresh Token: Lasts longer (e.g., 7 days)
    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET || 'your_even_more_secret_refresh_key_here',
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

module.exports = generateTokens;
