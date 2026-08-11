import React, { useState, useEffect } from 'react';
import { getAllQuestions } from '../services/questionService';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

import InteractiveWorkspace from './InteractiveWorkspace';

export default function ProblemDisplay() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProblems = async () => {
            try {
                const data = await getAllQuestions();
                setProblems(data);
                setLoading(false);
            } catch (err) {
                // Ensure error is converted to a string for rendering
                setError(err.message || String(err));
                setLoading(false);
            }
        };

        loadProblems();
    }, []);

    // Loading and Error States
    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading problems...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'red' }}>Error: {error}</div>;

    // Combined Logic: Show the Welcome/Placeholder screen if no problems are found
    if (problems.length === 0) {
        return (
            <div className="problem-display" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>Welcome to APITutor</h2>
                <p>Select a problem or API topic to get started.</p>
            </div>
        );
    }

    // Active Problem State
    const currentProblem = problems[0];

    return (
        <div className="problem-display" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#f8fafc' }}>
            <header style={{ borderBottom: '1px solid #334155', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ color: '#f8fafc', margin: 0 }}>{currentProblem.title}</h1>
                    <span style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', padding: '0.35rem 0.85rem', borderRadius: '16px', fontSize: '0.85rem' }}>
                        {currentProblem.difficulty}
                    </span>
                </div>
                <p style={{ fontSize: '1.15rem', marginTop: '1rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                    {currentProblem.problemStatement}
                </p>
                {currentProblem.initialEquation && (
                    <div role="math" aria-label={`Initial equation: ${currentProblem.initialEquation}`} style={{ fontSize: '1.5rem', margin: '1.5rem 0', padding: '1rem', background: '#1e293b', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                        <span className="sr-only">{currentProblem.initialEquation}</span>
                        <div aria-hidden="true" style={{ color: '#f8fafc' }}>
                            <BlockMath math={currentProblem.initialEquation} />
                        </div>
                    </div>
                )}
            </header>

            <InteractiveWorkspace />

            <section style={{ marginTop: '3rem' }}>
                <h2 style={{ color: '#f8fafc' }}>Logical Steps</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    {currentProblem.expectedSteps.map((step) => (
                        <div key={step._id || step.stepNumber} style={{ padding: '1.25rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#38bdf8' }}>Step {step.stepNumber}</p>
                            <p style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>{step.instruction}</p>
                            {step.formula && <BlockMath math={step.formula} />}
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ marginTop: '2rem', padding: '1.5rem', background: '#064e3b', border: '1px solid #059669', borderRadius: '8px', textAlign: 'center', color: '#4ade80' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Final Answer</h3>
                <div style={{ fontSize: '1.5rem' }}>
                    <InlineMath math={currentProblem.finalAnswer} />
                </div>
            </section>
        </div>
    );
}