const { parse } = require('mathjs');

/**
 * Extracts all operators and variables (symbols) from a mathjs node tree.
 */
const extractMathFeatures = (node) => {
    const features = {
        operators: new Set(),
        variables: new Set()
    };

    node.traverse((n) => {
        if (n.isOperatorNode) {
            features.operators.add(n.op);
        } else if (n.isSymbolNode && !n.isBuiltin) {
            features.variables.add(n.name);
        }
    });

    return features;
};

/**
 * Classifies the type of error made by the user.
 * Returns an object with the error type and a user-friendly hint.
 */
const classifyError = (userStep, expectedStep) => {
    try {
        const userNode = parse(userStep);
        const expectedNode = parse(expectedStep);

        const userFeatures = extractMathFeatures(userNode);
        const expectedFeatures = extractMathFeatures(expectedNode);

        // 1. Variable Mismatch (Wrong Formula/Logic)
        // E.g., Expected 'x^2 + y', User entered 'x^2 + 5' (forgot 'y')
        for (const v of expectedFeatures.variables) {
            if (!userFeatures.variables.has(v)) {
                return {
                    type: 'FORMULA_ERROR',
                    hint: `It looks like you are missing the variable '${v}' in your step. Did you use the right formula?`
                };
            }
        }

        // 2. Operator Mismatch (Wrong Formula/Logic)
        // E.g., Expected 'x^2', User entered 'x * 2' (multiplied instead of exponent)
        for (const op of expectedFeatures.operators) {
            if (!userFeatures.operators.has(op)) {
                return {
                    type: 'FORMULA_ERROR',
                    hint: `You might be using the wrong operation. Check if you should be using '${op}'.`
                };
            }
        }

        // 3. Calculation Mistake (Structure matches, but math is wrong)
        // E.g., Expected '5x', User entered '6x'
        return {
            type: 'CALCULATION_ERROR',
            hint: 'Your approach looks structurally correct, but there is a calculation mistake. Double-check your arithmetic.'
        };

    } catch (err) {
        // 4. Syntax Error (mathjs failed to parse)
        // E.g., '3x + * 2'
        return {
            type: 'SYNTAX_ERROR',
            hint: 'Your mathematical formatting is invalid. Check for misplaced operators or missing brackets.'
        };
    }
};

module.exports = { classifyError };
