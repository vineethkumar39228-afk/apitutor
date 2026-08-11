// A wrapper function that catches asynchronous errors and passes them to Express's next()
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
