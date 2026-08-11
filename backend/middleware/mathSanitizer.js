const cleanMathString = (str) => {
    if (typeof str !== 'string') return str;
    let eq = str.replace(/\s+/g, '');
    eq = eq.replace(/(\d)([a-zA-Z])/g, '$1*$2');
    eq = eq.replace(/(\d)(\()/g, '$1*$2');
    eq = eq.replace(/([a-zA-Z])(\()/g, '$1*$2');
    eq = eq.replace(/(\))(\()/g, '$1*$2');
    eq = eq.replace(/(\))([a-zA-Z\d])/g, '$1*$2');
    return eq;
};

const sanitizeMathInput = (req, res, next) => {
    let targetField = req.body && req.body.equation ? 'equation' : (req.body && req.body.step ? 'step' : null);

    if (targetField && typeof req.body[targetField] === 'string') {
        req.body[targetField] = cleanMathString(req.body[targetField]);
    }

    next();
};

sanitizeMathInput.cleanMathString = cleanMathString;

module.exports = sanitizeMathInput;
