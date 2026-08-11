const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const SolverEngine = require('../utils/solverEngine');
const Problem = require('../models/Problem'); // Bring in your Mongoose model
const Question = require('../models/Question'); // Fallback model
const sanitizeMathInput = require('../middleware/mathSanitizer'); // Import the middleware
const { evaluateUserStep } = require('../services/solverEngine');

// Insert the middleware into the chain
router.post('/solve', sanitizeMathInput, asyncHandler(async (req, res) => {
    const { equation } = req.body;

    if (!equation) {
        res.status(400);
        throw new Error('Please provide an equation to solve.');
    }

    // The 'equation' variable here is now fully sanitized!
    // E.g., if the user sent " 2x(x+ 3 ) ", it arrives here as "2*x*(x+3)"
    const engine = new SolverEngine(equation);
    const result = engine.evaluateExpression(engine.parsedData.cleanString);

    if (result === null) {
        res.status(400);
        throw new Error('Invalid mathematical expression provided.');
    }

    const steps = engine.generateSteps();

    res.status(200).json({
        success: true,
        original: equation,
        parsedData: engine.parsedData,
        result: result,
        steps: steps
    });
}));

// Route: Step-by-Step Validation with Error Diagnostics and Agentic Fallback
router.post('/validate-step', sanitizeMathInput, asyncHandler(async (req, res) => {
    const { problemId, currentStepIndex, step } = req.body;

    // 1. Validate Request Body
    if (!problemId || currentStepIndex === undefined || !step) {
        res.status(400);
        throw new Error('Missing required fields: problemId, currentStepIndex, or step.');
    }

    // 2. Fetch Database Record
    let problem = await Problem.findById(problemId);
    if (!problem) {
        problem = await Question.findById(problemId);
    }
    if (!problem) {
        res.status(404);
        throw new Error('Problem not found in the database.');
    }

    // 3. Check bounds
    if (currentStepIndex >= problem.expectedSteps.length) {
        return res.status(200).json({
            isCorrect: false,
            message: 'Problem is already completely solved.',
            isComplete: true,
            diagnostic: null
        });
    }

    // 4. Delegate to the Core Solver Engine Service
    const stepItem = problem.expectedSteps[currentStepIndex];
    const expectedStep = typeof stepItem === 'string' ? stepItem : (stepItem?.formula || stepItem?.instruction || '');
    const originalEquation = problem.originalEquation || problem.initialEquation || '';

    const evaluation = await evaluateUserStep(
        step,
        expectedStep,
        originalEquation
    );

    // 5. Determine if the entire problem is finished
    const isComplete = evaluation.isCorrect && (currentStepIndex === problem.expectedSteps.length - 1);

    // 6. Return standard JSON response
    res.status(200).json({
        success: true,
        isCorrect: evaluation.isCorrect,
        isComplete,
        message: evaluation.message,
        diagnostic: evaluation.diagnosticType
    });
}));


// New Route: Get Contextual Hint
// POST /api/solver/hint
router.post('/hint', asyncHandler(async (req, res) => {
    const { problemId, currentStepIndex } = req.body;

    // 1. Basic validation
    if (!problemId || currentStepIndex === undefined) {
        res.status(400);
        throw new Error('Missing required fields: problemId or currentStepIndex.');
    }

    // 2. Fetch the problem from MongoDB
    let problem = await Problem.findById(problemId);
    if (!problem) {
        problem = await Question.findById(problemId);
    }
    if (!problem) {
        res.status(404);
        throw new Error('Problem not found in the database.');
    }

    // 3. Prevent requesting hints if the problem is already done
    if (currentStepIndex >= problem.expectedSteps.length) {
        return res.status(400).json({
            success: false,
            message: 'Problem is already completely solved. No more hints available.'
        });
    }

    // 4. Retrieve the hint. 
    // If no hint is written in the DB for this step, provide a smart generic fallback.
    const hintText = problem.hints && problem.hints[currentStepIndex]
        ? problem.hints[currentStepIndex]
        : "Look at the operators in the equation. Try isolating the variable by performing the inverse operation on both sides.";

    // 5. Send the response
    res.status(200).json({
        success: true,
        step: currentStepIndex + 1,
        hint: hintText
    });
}));

module.exports = router;

