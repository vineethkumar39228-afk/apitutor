require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');

const sampleQuestions = [
    {
        title: "Basic Linear Equation",
        problemStatement: "Solve for x.",
        difficulty: "Easy",
        initialEquation: "2x + 4 = 12",
        expectedSteps: [
            { stepNumber: 1, instruction: "Subtract 4 from both sides.", formula: "2x = 8" },
            { stepNumber: 2, instruction: "Divide by 2.", formula: "x = 4" }
        ],
        finalAnswer: "x = 4"
    },
    {
        title: "Fraction Simplification",
        problemStatement: "Simplify the expression.",
        difficulty: "Easy",
        initialEquation: "\\frac{3x}{4} = 9",
        expectedSteps: [
            { stepNumber: 1, instruction: "Multiply both sides by 4.", formula: "3x = 36" },
            { stepNumber: 2, instruction: "Divide by 3.", formula: "x = 12" }
        ],
        finalAnswer: "x = 12"
    },
    {
        title: "Quadratic Equation (Factoring)",
        problemStatement: "Find the positive root of the equation.",
        difficulty: "Medium",
        initialEquation: "x^2 - 5x + 6 = 0",
        expectedSteps: [
            { stepNumber: 1, instruction: "Factor the quadratic equation.", formula: "(x - 2)(x - 3) = 0" },
            { stepNumber: 2, instruction: "Set each factor to zero.", formula: "x = 2, x = 3" }
        ],
        finalAnswer: "x = 3"
    },
    {
        title: "System of Equations",
        problemStatement: "Solve for y.",
        difficulty: "Medium",
        initialEquation: "\\begin{cases} x + y = 10 \\\\ x - y = 2 \\end{cases}",
        expectedSteps: [
            { stepNumber: 1, instruction: "Add the two equations to eliminate y.", formula: "2x = 12 \\implies x = 6" },
            { stepNumber: 2, instruction: "Substitute x back into the first equation.", formula: "6 + y = 10 \\implies y = 4" }
        ],
        finalAnswer: "y = 4"
    },
    {
        title: "Exponent Rules",
        problemStatement: "Simplify the exponents and solve for x.",
        difficulty: "Medium",
        initialEquation: "2^x \\cdot 2^3 = 2^{10}",
        expectedSteps: [
            { stepNumber: 1, instruction: "Apply the product rule for exponents.", formula: "2^{x+3} = 2^{10}" },
            { stepNumber: 2, instruction: "Equate the exponents.", formula: "x + 3 = 10" }
        ],
        finalAnswer: "x = 7"
    },
    {
        title: "Pythagorean Theorem",
        problemStatement: "Find the hypotenuse (c) of a right triangle with legs a=3 and b=4.",
        difficulty: "Easy",
        initialEquation: "c^2 = 3^2 + 4^2",
        expectedSteps: [
            { stepNumber: 1, instruction: "Square the legs.", formula: "c^2 = 9 + 16" },
            { stepNumber: 2, instruction: "Add the squared values.", formula: "c^2 = 25" },
            { stepNumber: 3, instruction: "Take the square root of both sides.", formula: "c = 5" }
        ],
        finalAnswer: "c = 5"
    },
    {
        title: "Logarithmic Equation",
        problemStatement: "Solve for x.",
        difficulty: "Hard",
        initialEquation: "\\log_2(x) + \\log_2(x-2) = 3",
        expectedSteps: [
            { stepNumber: 1, instruction: "Use the product property of logarithms.", formula: "\\log_2(x(x-2)) = 3" },
            { stepNumber: 2, instruction: "Convert to exponential form.", formula: "x(x-2) = 2^3 \\implies x^2 - 2x - 8 = 0" },
            { stepNumber: 3, instruction: "Factor the resulting quadratic.", formula: "(x-4)(x+2) = 0" }
        ],
        finalAnswer: "x = 4"
    },
    {
        title: "Trigonometric Identity",
        problemStatement: "Solve for \\theta where 0 \\le \\theta \\le 90^\\circ.",
        difficulty: "Hard",
        initialEquation: "2\\sin^2(\\theta) - 1 = 0",
        expectedSteps: [
            { stepNumber: 1, instruction: "Add 1 to both sides and divide by 2.", formula: "\\sin^2(\\theta) = \\frac{1}{2}" },
            { stepNumber: 2, instruction: "Take the square root.", formula: "\\sin(\\theta) = \\frac{1}{\\sqrt{2}}" }
        ],
        finalAnswer: "\\theta = 45^\\circ"
    },
    {
        title: "Percentage Word Problem",
        problemStatement: "If a $50 item is discounted by 20%, what is the final price?",
        difficulty: "Easy",
        initialEquation: "P = 50 - (0.20 \\cdot 50)",
        expectedSteps: [
            { stepNumber: 1, instruction: "Calculate the discount amount.", formula: "0.20 \\cdot 50 = 10" },
            { stepNumber: 2, instruction: "Subtract the discount from the original price.", formula: "P = 50 - 10" }
        ],
        finalAnswer: "P = 40"
    },
    {
        title: "Rational Equation",
        problemStatement: "Solve for x.",
        difficulty: "Medium",
        initialEquation: "\\frac{2}{x} = \\frac{1}{x-1}",
        expectedSteps: [
            { stepNumber: 1, instruction: "Cross-multiply.", formula: "2(x-1) = 1(x)" },
            { stepNumber: 2, instruction: "Distribute the 2.", formula: "2x - 2 = x" },
            { stepNumber: 3, instruction: "Subtract x and add 2 to both sides.", formula: "x = 2" }
        ],
        finalAnswer: "x = 2"
    }
];

const importData = async () => {
    try {
        await connectDB();

        // Clear out old data to avoid duplicates
        await Question.deleteMany();

        // Insert the 10 sample problems
        await Question.insertMany(sampleQuestions);

        console.log('10 Sample Questions Successfully Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error}`);
        process.exit(1);
    }
};

importData();