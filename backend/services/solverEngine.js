const { checkMathEquivalence } = require('../utils/mathEquivalence');
const { classifyError } = require('../utils/errorDiagnostics');
const { evaluateWithGemini } = require('../utils/geminiAgent');

/**
 * The core engine that evaluates a user's math step against the expected step.
 * Returns an evaluation object containing truthiness, messages, and diagnostic data.
 */
const evaluateUserStep = async (userStep, expectedStep, originalEquation) => {
    // --- PASS 1: Mathematical Equivalence Check ---
    const isEquivalent = checkMathEquivalence(userStep, expectedStep);

    if (isEquivalent) {
        return {
            isCorrect: true,
            message: 'Correct step! Keep going.',
            diagnosticType: null
        };
    }

    // --- PASS 2: Local Error Diagnostics (mathjs) ---
    const expectedClean = expectedStep.replace(/\s+/g, '');
    const userClean = userStep.replace(/\s+/g, '');
    const diagnostic = classifyError(userClean, expectedClean);

    // --- PASS 3: The Agentic Fallback (Gemini) ---
    if (diagnostic.type === 'SYNTAX_ERROR' || diagnostic.type === 'CALCULATION_ERROR') {
        const aiEvaluation = await evaluateWithGemini(originalEquation, expectedStep, userStep);

        return {
            isCorrect: aiEvaluation.isCorrect,
            message: aiEvaluation.hint,
            diagnosticType: aiEvaluation.isCorrect ? null : 'AI_GUIDANCE'
        };
    }

    // If local diagnostics identified a specific formula error, return it
    return {
        isCorrect: false,
        message: diagnostic.hint,
        diagnosticType: diagnostic.type
    };
};

module.exports = { evaluateUserStep };
