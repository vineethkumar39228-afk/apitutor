const { simplify } = require('mathjs');

/**
 * Checks if two mathematical strings are mathematically equivalent,
 * regardless of spacing, fractions, or decimals.
 */
const checkMathEquivalence = (userStep, expectedStep) => {
    try {
        // 1. Normalize weird spacing and convert leading decimals (e.g., .5 to 0.5)
        let u = userStep.replace(/\s+/g, '').replace(/(^|[^0-9])\./g, '$10.');
        let e = expectedStep.replace(/\s+/g, '').replace(/(^|[^0-9])\./g, '$10.');

        // Quick win: if string manipulation made them identical
        if (u === e) return true;

        // 2. Handle Equations (e.g., "2x = 4")
        if (u.includes('=') && e.includes('=')) {
            const [uLeft, uRight] = u.split('=');
            const [eLeft, eRight] = e.split('=');

            // Isolate both equations to zero and subtract them:
            // (uLeft - uRight) - (eLeft - eRight)
            const diff = `(${uLeft} - (${uRight})) - (${eLeft} - (${eRight}))`;

            // If the difference simplifies to 0, they are equivalent
            return simplify(diff).toString() === '0';
        }

        // 3. Handle Standard Expressions (e.g., "x + 1/2")
        const expressionDiff = `(${u}) - (${e})`;
        return simplify(expressionDiff).toString() === '0';

    } catch (err) {
        // If mathjs fails to parse (e.g., syntax error), return false
        return false;
    }
};

module.exports = { checkMathEquivalence };
