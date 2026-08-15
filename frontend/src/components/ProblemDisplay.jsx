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
                setError(err.message || String(err));
                setLoading(false);
            }
        };

        loadProblems();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-primary)' }}>Loading problems...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'var(--brand-error)' }}>Error: {error}</div>;

    if (problems.length === 0) {
        return (
            <div className="problem-display" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Welcome to APITutor</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Select a problem or API topic to get started.</p>
            </div>
        );
    }

    const currentProblem = problems[0];

    return (
        <div className="problem-display" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
            <header style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>{currentProblem.title}</h1>
                    <span className={`badge badge-${(currentProblem.difficulty || 'medium').toLowerCase()}`}>
                        {currentProblem.difficulty}
                    </span>
                </div>
                <p style={{ fontSize: '1.15rem', marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {currentProblem.problemStatement}
                </p>
                {currentProblem.initialEquation && (
                    <div role="math" aria-label={`Initial equation: ${currentProblem.initialEquation}`} style={{ fontSize: '1.5rem', margin: '1.5rem 0', padding: '1rem', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--brand-primary)' }}>
                        <span className="sr-only">{currentProblem.initialEquation}</span>
                        <div aria-hidden="true" style={{ color: 'var(--text-primary)' }}>
                            <BlockMath math={currentProblem.initialEquation} />
                        </div>
                    </div>
                )}
            </header>

            <InteractiveWorkspace />

            <section style={{ marginTop: '3rem' }}>
                <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Logical Steps</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    {currentProblem.expectedSteps.map((step) => (
                        <div key={step._id || step.stepNumber} style={{ padding: '1.25rem', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--brand-primary)', fontFamily: 'var(--font-heading)' }}>Step {step.stepNumber}</p>
                            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>{step.instruction}</p>
                            {step.formula && <BlockMath math={step.formula} />}
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--brand-success-soft)', border: '1px solid var(--brand-success)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--brand-success)' }}>
                <h3 style={{ margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>Final Answer</h3>
                <div style={{ fontSize: '1.5rem' }}>
                    <InlineMath math={currentProblem.finalAnswer} />
                </div>
            </section>
        </div>
    );
}