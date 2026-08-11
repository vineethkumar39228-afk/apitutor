const mongoose = require('mongoose');
const dns = require('dns');

// Fix for querySrv ECONNREFUSED caused by Windows local DNS resolvers
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // Ignore if DNS setting fails
}

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('your_mongodb_connection_string')) {
            console.error('Error: Please replace "your_mongodb_connection_string" in backend/.env with your actual MongoDB connection string.');
            process.exit(1);
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        if (error.message.includes('Authentication failed') || error.code === 8000) {
            console.error('\nMongoDB Connection Error: Authentication failed (bad auth).');
            console.error('Please verify your database username and password in backend/.env.');
        } else {
            console.error(`MongoDB Error: ${error.message}`);
        }
        process.exit(1);
    }
};

module.exports = connectDB;
