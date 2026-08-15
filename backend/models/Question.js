const mongoose = require('mongoose');

// Schema for the individual logical steps
const stepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  instruction: {
    type: String,
    required: true,
    // Example: "Isolate the variable x on the left side"
  },
  formula: {
    type: String,
    // Example: "2x = 10" (Can store LaTeX strings here if needed for the frontend)
  }
});

// Main schema for the mathematical question
const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  problemStatement: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  topic: {
    type: String,
    default: 'General Math',
    enum: [
      'General Math', 'Algebra', 'Calculus', 'Fractions',
      'Percentages', 'Time & Work', 'Probability',
      'Geometry', 'Number Systems', 'Data Interpretation'
    ]
  },
  expectedSteps: [stepSchema],
  finalAnswer: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    trim: true,
    // Store YouTube Video ID only (e.g., "dQw4w9WgXcQ")
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Question', questionSchema);