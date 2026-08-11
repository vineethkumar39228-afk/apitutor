const redis = require('redis');

// Initialize the Redis client. 
// It defaults to localhost:6379, but uses the environment variable if deployed.
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err.message || err));
redisClient.on('connect', () => console.log('Redis connected successfully!'));

// Connect immediately
redisClient.connect().catch((err) => console.error('Redis Connection Failed:', err.message || err));

module.exports = redisClient;
