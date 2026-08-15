const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// Adjust this path if your Question model is located elsewhere
const Question = require('./models/Question');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        const problems = JSON.parse(fs.readFileSync('./problems.json', 'utf-8'));

        // Clear out the old 10 hardcoded problems
        await Question.deleteMany();

        // Insert the new 15 diverse problems
        await Question.insertMany(problems);

        console.log('Database successfully seeded with 15 new problems!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();