const { checkMathEquivalence } = require('./mathEquivalence');

describe('checkMathEquivalence Utility', () => {
    test('should return true for identical strings', () => {
        expect(checkMathEquivalence('2x = 8', '2x = 8')).toBe(true);
    });

    test('should handle fraction vs decimal equivalence (1/2 vs 0.5)', () => {
        expect(checkMathEquivalence('x + 1/2', 'x + 0.5')).toBe(true);
    });

    test('should handle leading decimals (.5 vs 0.5)', () => {
        expect(checkMathEquivalence('x + .5', 'x + 0.5')).toBe(true);
    });

    test('should handle equation equivalence (2x = 8 vs 2*x = 8)', () => {
        expect(checkMathEquivalence('2x = 8', '2*x = 8')).toBe(true);
    });

    test('should return false for non-equivalent steps', () => {
        expect(checkMathEquivalence('x = 3', 'x = 4')).toBe(false);
    });

    test('should return false gracefully on syntax errors / words', () => {
        expect(checkMathEquivalence('subtract 2 from both sides', '2x = 8')).toBe(false);
    });
});
