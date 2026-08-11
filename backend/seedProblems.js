require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Problem = require('./models/Problem');

const sampleProblems = [
    {
        title: "Basic Linear Equation",
        originalEquation: "2x + 4 = 12",
        expectedSteps: ["2x = 8", "x = 4"],
        hints: ["Subtract 4 from both sides", "Divide by 2"],
        topic: "Algebra",
        difficulty: "Easy"
    },
    {
        title: "Fraction Simplification",
        originalEquation: "3x / 4 = 9",
        expectedSteps: ["3x = 36", "x = 12"],
        hints: ["Multiply both sides by 4", "Divide by 3"],
        topic: "Fractions",
        difficulty: "Easy"
    },
    {
        title: "Quadratic Equation",
        originalEquation: "x^2 - 5x + 6 = 0",
        expectedSteps: ["(x - 2)(x - 3) = 0", "x = 2 or x = 3"],
        hints: ["Factor into two binomials", "Find values where expression equals 0"],
        topic: "Algebra",
        difficulty: "Medium"
    },
    {
        title: "Basic Derivative",
        originalEquation: "d/dx (3x^2 + 5x) = 0",
        expectedSteps: ["6x + 5 = 0", "6x = -5", "x = -5/6"],
        hints: ["Apply the power rule to 3x^2 and 5x", "Solve for x"],
        topic: "Calculus",
        difficulty: "Hard"
    },
    {
        title: "Simple Addition",
        originalEquation: "x + 15 = 45",
        expectedSteps: ["x = 30"],
        hints: ["Subtract 15 from both sides"],
        topic: "General Math",
        difficulty: "Easy"
    }
];

const seedProblems = async () => {
    try {
        await connectDB();
        await Problem.deleteMany({});
        await Problem.insertMany(sampleProblems);
        console.log('Sample problems seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedProblems();
