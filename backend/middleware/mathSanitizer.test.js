const sanitizeMathInput = require('./mathSanitizer');

describe('mathSanitizer Middleware', () => {
    test('should clean whitespace and insert implicit multiplication in equation', () => {
        const req = { body: { equation: ' 2x(x + 3) ' } };
        const res = {};
        const next = jest.fn();

        sanitizeMathInput(req, res, next);

        expect(req.body.equation).toBe('2*x*(x+3)');
        expect(next).toHaveBeenCalled();
    });

    test('should clean whitespace and insert implicit multiplication in step', () => {
        const req = { body: { step: ' 3(x + 1) ' } };
        const res = {};
        const next = jest.fn();

        sanitizeMathInput(req, res, next);

        expect(req.body.step).toBe('3*(x+1)');
        expect(next).toHaveBeenCalled();
    });

    test('should pass through if no body or equation/step provided', () => {
        const req = { body: {} };
        const res = {};
        const next = jest.fn();

        sanitizeMathInput(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('cleanMathString helper function works directly', () => {
        const result = sanitizeMathInput.cleanMathString('(x+1)(x-1)');
        expect(result).toBe('(x+1)*(x-1)');
    });
});
