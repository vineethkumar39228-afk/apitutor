// 1. Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Production Safeguard: Validate required environment variables on startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'GEMINI_API_KEY'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`FATAL ERROR: Environment variable ${envVar} is missing.`);
        process.exit(1); // Stop the server immediately
    }
});

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const solverRoutes = require('./routes/solverRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questions');
const progressRoutes = require('./routes/progressRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// 2. Establish database connection
connectDB();

// 3. Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// 1. Trust Proxy
// Tells rate limiter to read actual user IP behind Docker/Nginx proxies
app.set('trust proxy', 1);

// 2. HTTP Request Logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 2. Helmet - Secures HTTP headers
app.use(helmet());

// 3. Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per 15 minutes
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply global limiter to all routes starting with /api
app.use('/api', globalLimiter);

// 4. Strict Auth Rate Limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to only 10 login/register attempts per 15 minutes
    message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Apply strict auth limiter to authentication endpoints
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Apply General Middlewares
app.use(express.json());
app.use(cookieParser());

// Allow requests from Vite frontend (port 5173 or 3000)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

// 5. Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/solver', solverRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'APITutor Backend API is running' });
});

// 6. Fallback Middleware for unhandled routes
app.use(notFound);

// 7. Global Error Handling Middleware (MUST BE LAST)
app.use(errorHandler);

// 8. Start the server with EADDRINUSE auto-recovery and graceful Nodemon shutdown
const startServer = () => {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });

    // Permanent EADDRINUSE Auto-Recovery
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`[Port Handler] Port ${PORT} is occupied. Cleaning up ghost process...`);
            const { execSync } = require('child_process');
            try {
                execSync(`npx kill-port ${PORT}`, { stdio: 'ignore' });
                console.log(`[Port Handler] Successfully cleared port ${PORT}. Retrying...`);
                setTimeout(() => {
                    server.close();
                    startServer();
                }, 1000);
            } catch (e) {
                console.error(`[Port Handler] Failed to auto-clear port ${PORT}:`, e.message);
            }
        } else {
            console.error('Server error:', err);
        }
    });

    // Graceful Shutdown for Nodemon & System Signals
    process.once('SIGUSR2', () => {
        server.close(() => {
            process.kill(process.pid, 'SIGUSR2');
        });
    });

    process.on('SIGINT', () => {
        server.close(() => {
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        server.close(() => {
            process.exit(0);
        });
    });
};

startServer();