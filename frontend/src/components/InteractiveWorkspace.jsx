import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

// Reusable UI components
import Button from './ui/Button';
import Input from './ui/Input';
import VideoExplainer from './ui/VideoExplainer';

const InteractiveWorkspace = ({ problemId: propProblemId }) => {
    const { id } = useParams();
    const effectiveProblemId = propProblemId || id;

    const [problemDetails, setProblemDetails] = useState(null);

    // Existing state for full equation solving
    const [equation, setEquation] = useState('');
    const [currentInput, setCurrentInput] = useState('');
    const [submittedSteps, setSubmittedSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // New state for Step-by-Step Validation & Diagnostics
    const [stepInput, setStepInput] = useState('');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [stepStatus, setStepStatus] = useState(null); // 'correct', 'incorrect', or null
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isProblemComplete, setIsProblemComplete] = useState(false);
    const [diagnosticType, setDiagnosticType] = useState(null);

    // Hint System State
    const [currentHint, setCurrentHint] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [isHintLoading, setIsHintLoading] = useState(false);

    // Evaluation and AI Mode States
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [aiModeActive, setAiModeActive] = useState(false);

    useEffect(() => {
        if (effectiveProblemId) {
            api.get(`/questions/${effectiveProblemId}`)
                .then(res => {
                    setProblemDetails(res.data);
                    const startEq = res.data.originalEquation || res.data.initialEquation || res.data.equation || '';
                    if (startEq) {
                        setCurrentInput(startEq);
                        setEquation(startEq);
                    }
                })
                .catch(err => console.error('Failed to load problem details:', err));
        }
    }, [effectiveProblemId]);

    // Handle user typing for real-time preview
    const handleInputChange = (e) => {
        setCurrentInput(e.target.value);
        setError(''); // Clear any previous errors when typing resumes
    };

    // Helper function to validate input before API call
    const validateInput = (input) => {
        if (!input.trim()) {
            return "Please enter an equation before submitting.";
        }

        const validCharsRegex = /^[a-zA-Z0-9\s+\-*/().^=]+$/;
        if (!validCharsRegex.test(input)) {
            return "Invalid characters detected. Please use only numbers, variables, and math operators.";
        }

        const openParens = (input.match(/\(/g) || []).length;
        const closeParens = (input.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            return "Mismatched parentheses. Please ensure all brackets are closed.";
        }

        return null;
    };

    const handleStepSubmit = async (e) => {
        e.preventDefault();
        if (!stepInput.trim()) return;

        setStepStatus(null);
        setFeedbackMessage('');
        setDiagnosticType(null); // Reset on new submission
        setIsEvaluating(true);

        // AI Latency Detector: If request takes > 500ms, Gemini has intervened
        const aiTimeout = setTimeout(() => {
            setAiModeActive(true);
        }, 500);

        try {
            const response = await api.post(
                '/solver/validate-step',
                {
                    problemId: effectiveProblemId,
                    currentStepIndex: currentStepIndex,
                    step: stepInput
                },
                {
                    timeout: 10000 // 10-second hard limit on the request
                }
            );

            const { isCorrect, isComplete, message, diagnostic } = response.data;

            if (isCorrect) {
                setStepStatus('correct');
                setFeedbackMessage(message);
                setDiagnosticType(null);

                // Clear the hint when the user gets the step right
                setShowHint(false);
                setCurrentHint('');

                if (isComplete) {
                    setIsProblemComplete(true);
                } else {
                    // Prepare for the next step after a short delay so the user sees the green tick
                    setTimeout(() => {
                        setCurrentStepIndex((prev) => prev + 1);
                        setStepInput('');
                        setStepStatus(null);
                        setFeedbackMessage('');
                        setDiagnosticType(null);
                        setShowHint(false);
                        setCurrentHint('');
                    }, 1500);
                }
            } else {
                setStepStatus('incorrect');
                setFeedbackMessage(message);
                setDiagnosticType(diagnostic); // Save the error classification from the API
            }
        } catch (err) {
            setStepStatus('incorrect');
            setDiagnosticType('SYSTEM_ERROR');

            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                setFeedbackMessage('The AI Tutor is taking too long to respond. Please check your connection and try again.');
            } else {
                setFeedbackMessage(err.response?.data?.message || 'A system error occurred while validating your step.');
            }
        } finally {
            // Cleanup the timeout and reset loading states when the API finishes
            clearTimeout(aiTimeout);
            setIsEvaluating(false);
            setAiModeActive(false);
        }
    };

    // NEW: Fetch Hint Logic
    const handleGetHint = async () => {
        // If we already have the hint, just toggle it open/closed
        if (currentHint) {
            setShowHint(!showHint);
            return;
        }

        setIsHintLoading(true);
        setFeedbackMessage(''); // Clear any previous errors
        try {
            const response = await api.post(
                '/solver/hint',
                { problemId: effectiveProblemId, currentStepIndex },
                {
                    timeout: 5000 // 5-second limit for hints
                }
            );

            setCurrentHint(response.data.hint);
            setShowHint(true); // Automatically expand once fetched
        } catch (err) {
            setDiagnosticType('SYSTEM_ERROR');
            setStepStatus('incorrect'); // Trigger the error box to show

            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                setFeedbackMessage('Request timed out while fetching your hint. Please try again.');
            } else {
                setFeedbackMessage('Could not load hint due to a server error.');
            }
        } finally {
            setIsHintLoading(false);
        }
    };

    // Helper function to determine UI styling based on error type
    const getDiagnosticStyles = () => {
        switch (diagnosticType) {
            case 'AI_GUIDANCE': // NEW: Specialized styling for Gemini's feedback
                return {
                    bg: '#f3e8ff', // Soft purple
                    border: '#d8b4fe',
                    text: '#6b21a8',
                    icon: '✨'
                };
            case 'FORMULA_ERROR':
            case 'CALCULATION_ERROR':
                return {
                    bg: '#fff3cd', // Soft yellow
                    border: '#ffe69c',
                    text: '#664d03',
                    icon: '💡' // Helpful hint
                };
            case 'SYNTAX_ERROR':
            case 'EMPTY_INPUT':
            case 'SYSTEM_ERROR':
                return {
                    bg: '#f8d7da', // Soft red
                    border: '#f5c2c7',
                    text: '#842029',
                    icon: '⚠️' // Warning
                };
            default:
                return {
                    bg: '#f8f9fa',
                    border: '#dee2e6',
                    text: '#495057',
                    icon: 'ℹ️'
                };
        }
    };

    const diagnosticUI = getDiagnosticStyles();

    // Handle the "Submit Step" interaction for full equation solver
    const handleSubmitStep = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateInput(currentInput);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post(
                '/solver/solve',
                { equation: currentInput }
            );

            const { original, parsedData, steps } = response.data;

            setSubmittedSteps((prevSteps) => [
                ...prevSteps,
                {
                    id: Date.now(),
                    equation: original,
                    parsedNumbers: parsedData.numbers,
                    backendMessage: steps[0]?.instruction || 'Step processed successfully.'
                }
            ]);

            setCurrentInput('');
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Failed to process equation. Make sure the backend is running!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="workspace-container" style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>Interactive Math Workspace</h2>
            {problemDetails && (
                <div style={{ marginBottom: '20px', padding: '20px', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }} className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, color: 'var(--brand-primary)', fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>{problemDetails.title}</h3>
                        {problemDetails.difficulty && (
                            <span className={`badge badge-${problemDetails.difficulty.toLowerCase()}`}>
                                {problemDetails.difficulty}
                            </span>
                        )}
                    </div>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        {problemDetails.problemStatement || problemDetails.description || (problemDetails.originalEquation ? `Solve the equation step by step:` : 'Solve the math problem step by step.')}
                    </p>
                    {(problemDetails.originalEquation || problemDetails.initialEquation) && (
                        <div role="math" aria-label={`Equation: ${problemDetails.originalEquation || problemDetails.initialEquation}`} style={{ marginTop: '12px', padding: '12px', background: 'var(--surface-base)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--brand-primary)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Starting Equation:</span>
                            <code style={{ fontSize: '1.25rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', background: 'transparent', padding: 0 }}>{problemDetails.originalEquation || problemDetails.initialEquation}</code>
                        </div>
                    )}
                    {problemDetails.videoUrl && (
                        <VideoExplainer videoId={problemDetails.videoUrl} title={`${problemDetails.title} — Explanation`} />
                    )}
                </div>
            )}

            {/* Step-by-step Validation Section */}
            {effectiveProblemId && (
                <div className="step-validation-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Step-by-Step Solver</h3>
                    {!isProblemComplete ? (
                        <div className="step-container" style={{ margin: '20px 0', padding: '20px', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>

                            {/* AI Mode Active Overlay/Indicator */}
                            {aiModeActive && (
                                <div style={{
                                    position: 'absolute', top: '-15px', right: '20px',
                                    backgroundColor: '#8b5cf6', color: 'white',
                                    padding: '4px 12px', borderRadius: '12px',
                                    fontSize: '0.85rem', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                                }}>
                                    ✨ AI Tutor is analyzing your logic...
                                </div>
                            )}

                            <h4 style={{ margin: '0 0 15px 0', color: 'var(--brand-primary)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Step {currentStepIndex + 1}</h4>

                            <form className="workspace-form" onSubmit={handleStepSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                {/* REFACTORED: Custom Input with Accessibility Label */}
                                <Input
                                    value={stepInput}
                                    onChange={(e) => {
                                        setStepInput(e.target.value);
                                        setStepStatus(null);
                                        setDiagnosticType(null);
                                    }}
                                    placeholder="Enter your next step..."
                                    ariaLabel="Enter your next step"
                                    disabled={isEvaluating}
                                />

                                {/* Custom Button (Primary) */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isEvaluating || stepStatus === 'correct' || isHintLoading}
                                    isLoading={isEvaluating}
                                    aria-label="Submit math step"
                                >
                                    Submit Step
                                </Button>

                                {/* Custom Button (Secondary) */}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleGetHint}
                                    disabled={isHintLoading || stepStatus === 'correct' || isEvaluating}
                                    isLoading={isHintLoading}
                                    aria-label="Get hint for current step"
                                >
                                    💡 Need a hint?
                                </Button>

                                {stepStatus === 'correct' && (
                                    <span className="icon-correct" role="img" aria-label="Step correct" style={{ color: 'var(--brand-success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        ✅
                                    </span>
                                )}
                                {stepStatus === 'incorrect' && (
                                    <span className="icon-incorrect" role="img" aria-label="Step incorrect" style={{ color: 'var(--brand-error)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        ❌
                                    </span>
                                )}
                            </form>

                            {/* Math Scroll Container for hint and feedback */}
                            <div className="math-scroll-container">
                                {/* Expandable Hint Box */}
                                {showHint && currentHint && (
                                    <div
                                        className="hint-display"
                                        role="region"
                                        aria-live="polite"
                                        style={{
                                            marginTop: '15px',
                                            padding: '15px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            borderLeft: '4px solid var(--brand-primary)',
                                            color: 'var(--text-primary)',
                                            borderRadius: 'var(--radius-sm)',
                                            animation: 'fadeIn 0.3s ease-in-out'
                                        }}
                                    >
                                        <strong style={{ color: 'var(--brand-primary)' }}>Teacher's Hint: </strong> {currentHint}
                                    </div>
                                )}

                                {/* Diagnostic Feedback UI - Announced immediately via role="alert" */}
                                {stepStatus === 'incorrect' && feedbackMessage && !showHint && (
                                    <div
                                        className="diagnostic-box"
                                        role="alert"
                                        aria-live="assertive"
                                        style={{
                                            marginTop: '15px',
                                            padding: '12px 15px',
                                            backgroundColor: diagnosticUI.bg,
                                            border: `1px solid ${diagnosticUI.border}`,
                                            color: diagnosticUI.text,
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.4'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }} aria-hidden="true">{diagnosticUI.icon}</span>
                                        <span><strong>{diagnosticType === 'AI_GUIDANCE' ? 'AI Suggestion: ' : 'Feedback: '}</strong>{feedbackMessage}</span>
                                    </div>
                                )}
                            </div>

                            {/* Success Message */}
                            {stepStatus === 'correct' && feedbackMessage && (
                                <div role="status" aria-live="polite" style={{ marginTop: '15px', color: 'var(--brand-success)', fontWeight: 'bold' }}>
                                    {feedbackMessage}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="completion-message" style={{ color: 'var(--brand-success)', fontSize: '1.2rem', fontWeight: 'bold', margin: '20px 0', padding: '20px', background: 'var(--brand-success-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--brand-success)' }}>
                            🎉 Congratulations! You have successfully solved the problem.
                        </div>
                    )}
                </div>
            )}

            {/* History of Submitted Steps */}
            <div className="step-history" style={{ marginBottom: '30px' }}>
                <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Solver History</h3>
                {submittedSteps.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No steps submitted yet. Start typing below!</p>
                ) : (
                    submittedSteps.map((step, index) => (
                        <div key={step.id} style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '15px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                            <strong style={{ color: 'var(--brand-primary)' }}>Step {index + 1}:</strong>
                            <BlockMath math={step.equation} />
                            <small style={{ color: 'var(--text-muted)' }}>{step.backendMessage}</small>
                        </div>
                    ))
                )}
            </div>

            {/* Real-time Preview Area */}
            <div className="preview-area" style={{ minHeight: '60px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '15px', color: 'var(--text-primary)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Live Preview:</span>
                <BlockMath math={currentInput || '\\text{...}'} errorColor={'var(--brand-error)'} />
            </div>

            {/* Input and Submit Form */}
            <form onSubmit={handleSubmitStep} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={currentInput}
                    onChange={handleInputChange}
                    placeholder="e.g., 2x + 4 = 8"
                    aria-label="Solve equation input"
                    style={{ flex: 1, padding: '10px 14px', fontSize: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-input)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color var(--transition-fast)' }}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all var(--transition-base)' }}
                >
                    {isLoading ? 'Processing...' : 'Solve Equation'}
                </button>
            </form>

            {/* Error Messaging */}
            {error && <p style={{ color: 'var(--brand-error)', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};

export default InteractiveWorkspace;
