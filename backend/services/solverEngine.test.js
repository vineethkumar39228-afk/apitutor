const { evaluateUserStep } = require('./solverEngine');

describe('solverEngine Service', () => {
    test('should evaluate mathematically equivalent step as correct (Pass 1)', async () => {
        const result = await evaluateUserStep('2x = 8', '2*x = 8', '2x + 4 = 12');
        expect(result.isCorrect).toBe(true);
        expect(result.message).toBe('Correct step! Keep going.');
        expect(result.diagnosticType).toBeNull();
    });

    test('should evaluate calculation error through local diagnostics or agentic fallback (Pass 2/3)', async () => {
        const result = await evaluateUserStep('2x = 10', '2x = 8', '2x + 4 = 12');
        expect(result.isCorrect).toBe(false);
        expect(result.message).toBeDefined();
        expect(['CALCULATION_ERROR', 'AI_GUIDANCE']).toContain(result.diagnosticType);
    });

    test('should handle abstract text input via agentic fallback (Pass 3)', async () => {
        const result = await evaluateUserStep('subtract 4 from both sides', '2x = 8', '2x + 4 = 12');
        expect(result).toHaveProperty('isCorrect');
        expect(result).toHaveProperty('message');
    });
});
