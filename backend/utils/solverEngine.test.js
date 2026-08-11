const SolverEngine = require('./solverEngine');

describe('SolverEngine Logic', () => {

    describe('parseInput()', () => {
        test('should extract numbers and symbols accurately', () => {
            const engine = new SolverEngine('2x + 4 = 8');

            expect(engine.parsedData.numbers).toEqual([2, 4, 8]);
            expect(engine.parsedData.symbols).toEqual(['x', '+', '=']);
            expect(engine.parsedData.cleanString).toBe('2x+4=8');
        });

        test('should handle empty or invalid inputs gracefully', () => {
            const engine = new SolverEngine('');

            expect(engine.parsedData.numbers).toEqual([]);
            expect(engine.parsedData.symbols).toEqual([]);
        });

        test('should extract decimal numbers correctly', () => {
            const engine = new SolverEngine('3.14 * r = 10.5');

            expect(engine.parsedData.numbers).toEqual([3.14, 10.5]);
        });
    });

    describe('evaluateExpression()', () => {
        test('should safely evaluate valid arithmetic using mathjs', () => {
            const engine = new SolverEngine(''); // Instantiating just to use the method

            // Order of operations test: 3 * 4 happens first (12), then + 2
            const result = engine.evaluateExpression('2 + 3 * 4');
            expect(result).toBe(14);
        });

        test('should return null for malformed or unsafe mathematical expressions', () => {
            const engine = new SolverEngine('');

            // Invalid syntax that would normally crash standard parsers
            const result = engine.evaluateExpression('2 + + * 4');
            expect(result).toBeNull();
        });
    });

});
