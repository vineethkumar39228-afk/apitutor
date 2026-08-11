const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Acts as a fallback agent to evaluate complex or abstract user math inputs.
 */
const evaluateWithGemini = async (originalEquation, expectedStep, userStep) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            // Force the model to return JSON to prevent parsing errors in our API
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
      You are an expert AI Math Tutor evaluator.
      The user is solving this problem: "${originalEquation}"
      The exact expected mathematical step is: "${expectedStep}"
      The user submitted this input: "${userStep}"

      Analyze the user's input. Did they express the mathematically correct next step, even if they used words, unconventional formatting, or abstract reasoning?

      Return a JSON object with strictly these two properties:
      1. "isCorrect": boolean (true if their logic is sound and matches the expected outcome, false otherwise)
      2. "hint": string (If correct, say "Great logical step!". If false, provide a brief, gentle 1-sentence hint guiding them toward the expected step without giving away the exact answer.)
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON returned by Gemini
        return JSON.parse(responseText);

    } catch (error) {
        console.error("Gemini Agent Error:", error);
        // If the agent fails, return a safe fallback response
        return {
            isCorrect: false,
            hint: "I couldn't quite understand that formatting. Try writing it as a standard mathematical equation."
        };
    }
};

module.exports = { evaluateWithGemini };
