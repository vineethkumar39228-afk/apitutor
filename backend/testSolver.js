const SolverEngine = require('./utils/solverEngine');

const equation = "2x + 5 = 15.5";
console.log(`Testing Equation: "${equation}"\n`);

const solver = new SolverEngine(equation);

console.log("Parsed Data:");
console.log(solver.parsedData);
