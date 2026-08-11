const { classifyError } = require('./errorDiagnostics');

describe('errorDiagnostics Utility', () => {
    test('should detect missing variables (FORMULA_ERROR)', () => {
        const result = classifyError('x^2 + 5', 'x^2 + y');
        expect(result.type).toBe('FORMULA_ERROR');
        expect(result.hint).toContain("missing the variable 'y'");
    });

    test('should detect missing operators (FORMULA_ERROR)', () => {
        const result = classifyError('x * 2', 'x ^ 2');
        expect(result.type).toBe('FORMULA_ERROR');
        expect(result.hint).toContain("wrong operation");
    });

    test('should detect calculation mistakes when structure matches (CALCULATION_ERROR)', () => {
        const result = classifyError('6*x', '5*x');
        expect(result.type).toBe('CALCULATION_ERROR');
        expect(result.hint).toContain("calculation mistake");
    });

    test('should handle syntax errors gracefully (SYNTAX_ERROR)', () => {
        const result = classifyError('3x + * 2', '3*x + 2');
        expect(result.type).toBe('SYNTAX_ERROR');
        expect(result.hint).toContain("formatting is invalid");
    });
});
