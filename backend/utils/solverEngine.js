const { evaluate } = require('mathjs');

class SolverEngine {
    constructor(problemString) {
        this.rawProblem = problemString;
        this.parsedData = this.parseInput(problemString);
    }

    /**
     * Basic text parser to extract numbers and symbols.
     */
    parseInput(input) {
        if (!input || typeof input !== 'string') {
            return { cleanString: '', numbers: [], symbols: [] };
        }

        const cleanInput = input.replace(/\s+/g, '');
        const extractedNumbers = cleanInput.match(/\d+(\.\d+)?/g) || [];
        const extractedSymbols = cleanInput.match(/[a-zA-Z+\-*/=()]/g) || [];

        return {
            cleanString: cleanInput,
            numbers: extractedNumbers.map(Number),
            symbols: extractedSymbols
        };
    }

    /**
     * Safely evaluates a mathematical expression string.
     * @param {string} expression - The math string to evaluate (e.g., "2 + 3 * 4")
     * @returns {number|null} - The calculated result, or null if invalid.
     */
    evaluateExpression(expression) {
        try {
            // mathjs safely parses and evaluates the string
            const result = evaluate(expression);
            return result;
        } catch (error) {
            console.error('MathJS Evaluation Error:', error.message);
            return null;
        }
    }

    generateSteps() {
        const steps = [];
        steps.push({
            stepNumber: 1,
            instruction: "Initial parsing of the equation components.",
            formula: this.rawProblem,
            parsedComponents: this.parsedData
        });
        return steps;
    }
}

module.exports = SolverEngine;
