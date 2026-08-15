import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TOPICS = [
    'Algebra', 'Calculus', 'Fractions', 'General Math',
    'Percentages', 'Time & Work', 'Probability',
    'Geometry', 'Number Systems', 'Data Interpretation'
];

const ProblemCatalog = () => {
    const [problems, setProblems] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    const navigate = useNavigate();

    const fetchProblems = useCallback(async (pageToFetch = 1) => {
        setIsLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: pageToFetch,
                limit: 12,
            });

            if (searchTerm) params.append('search', searchTerm);
            if (topicFilter) params.append('topic', topicFilter);
            if (difficultyFilter) params.append('difficulty', difficultyFilter);

            const response = await api.get(`/questions?${params.toString()}`);

            const responseData = response.data.data || (Array.isArray(response.data) ? response.data : []);
            setProblems(responseData);
            setPagination(response.data.pagination || { page: 1, pages: 1, total: responseData.length });
        } catch (err) {
            setError('Failed to load problems. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, topicFilter, difficultyFilter]);

    useEffect(() => {
        fetchProblems(1);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProblems(1);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setTopicFilter('');
        setDifficultyFilter('');
        setTimeout(() => fetchProblems(1), 0);
    };

    const getDifficultyClass = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'badge badge-easy';
            case 'medium': return 'badge badge-medium';
            case 'hard': return 'badge badge-hard';
            default: return 'badge';
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header} className="animate-fade-in">
                <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: '0 0 8px 0' }}>
                    📚 Problem Catalog
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Browse and search for math problems to practice.</p>
            </header>

            {/* --- Filter & Search Controls --- */}
            <form onSubmit={handleSearchSubmit} style={styles.filterSection} className="workspace-form">
                <input
                    type="text"
                    placeholder="Search equations or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />

                <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    style={styles.selectInput}
                >
                    <option value="">All Topics</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    style={styles.selectInput}
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                <button type="submit" style={styles.primaryButton}>Search</button>
                <button type="button" onClick={handleClearFilters} style={styles.secondaryButton}>Clear</button>
            </form>

            {/* --- Problem List --- */}
            {error && <div style={{ color: 'var(--brand-error)', margin: '20px 0', padding: '12px', background: 'var(--brand-error-soft)', borderRadius: 'var(--radius-sm)' }}>⚠️ {error}</div>}

            {isLoading ? (
                <div style={styles.grid} className="problems-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ ...styles.card, minHeight: '180px' }}>
                            <div className="skeleton-row" style={{ height: '16px', width: '60%', marginBottom: '12px' }} />
                            <div className="skeleton-row" style={{ height: '24px', width: '80%', marginBottom: '12px' }} />
                            <div className="skeleton-row" style={{ height: '40px', width: '100%', marginBottom: '16px' }} />
                            <div className="skeleton-row" style={{ height: '36px', width: '100%' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.grid} className="problems-grid">
                    {problems && problems.length > 0 ? (
                        problems.map((problem, index) => (
                            <div
                                key={problem._id}
                                style={{ ...styles.card, animationDelay: `${index * 50}ms` }}
                                className="animate-slide-up"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--surface-border)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    <span className="badge badge-topic">{problem.topic || 'General Math'}</span>
                                    <span className={getDifficultyClass(problem.difficulty)}>
                                        {problem.difficulty || 'Medium'}
                                    </span>
                                </div>

                                <h3 style={{ margin: '15px 0 5px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                                    {problem.title}
                                </h3>

                                <div role="math" aria-label={`Equation: ${problem.originalEquation || problem.title}`}>
                                    <span className="sr-only">{problem.originalEquation || problem.title}</span>
                                    <code aria-hidden="true" style={styles.equationDisplay}>
                                        {problem.originalEquation}
                                    </code>
                                </div>

                                <button
                                    onClick={() => navigate(`/problem/${problem._id}`)}
                                    style={styles.solveButton}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Solve Problem →
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '1.1rem' }}>No problems found matching your filters.</p>
                        </div>
                    )}
                </div>
            )}

            {/* --- Pagination Controls --- */}
            {!isLoading && problems && problems.length > 0 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => fetchProblems(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        style={pagination.page === 1 ? styles.pageButtonDisabled : styles.pageButton}
                    >
                        ← Previous
                    </button>

                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        Page {pagination.page} of {pagination.pages}
                    </span>

                    <button
                        onClick={() => fetchProblems(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        style={pagination.page === pagination.pages ? styles.pageButtonDisabled : styles.pageButton}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)' },
    header: { marginBottom: '30px' },
    filterSection: {
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        background: 'var(--surface-raised)',
        padding: '20px', borderRadius: 'var(--radius-lg)',
        marginBottom: '30px', border: '1px solid var(--surface-border)',
        boxShadow: 'var(--shadow-sm)'
    },
    searchInput: {
        flex: 2, minWidth: '200px', padding: '10px 15px',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)',
        outline: 'none', backgroundColor: 'var(--surface-input)', color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)', fontSize: '0.95rem',
        transition: 'border-color var(--transition-fast)'
    },
    selectInput: {
        flex: 1, minWidth: '150px', padding: '10px',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)',
        outline: 'none', backgroundColor: 'var(--surface-input)', color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)'
    },
    primaryButton: {
        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
        color: 'white', padding: '10px 20px', border: 'none',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600,
        fontFamily: 'var(--font-body)', transition: 'all var(--transition-base)'
    },
    secondaryButton: {
        backgroundColor: 'var(--surface-overlay)', color: 'var(--text-primary)',
        padding: '10px 20px', border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600,
        fontFamily: 'var(--font-body)'
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
    card: {
        background: 'var(--surface-raised)', padding: '22px',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)',
        boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column',
        transition: 'all var(--transition-base)', cursor: 'default'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    equationDisplay: {
        display: 'block', backgroundColor: 'var(--surface-base)', padding: '12px',
        borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--brand-primary)',
        color: 'var(--brand-primary)', marginTop: '10px', overflowX: 'auto',
        fontFamily: 'var(--font-mono)', fontSize: '0.95rem'
    },
    solveButton: {
        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
        color: 'white', padding: '10px 20px', border: 'none',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600,
        fontFamily: 'var(--font-body)', width: '100%', marginTop: 'auto',
        paddingTop: '12px', paddingBottom: '12px',
        transition: 'all var(--transition-base)', fontSize: '0.95rem'
    },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' },
    pageButton: {
        background: 'transparent', color: 'var(--brand-primary)', padding: '8px 16px',
        border: '1px solid var(--brand-primary)', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', fontWeight: 600, transition: 'all var(--transition-base)',
        fontFamily: 'var(--font-body)'
    },
    pageButtonDisabled: {
        background: 'var(--surface-overlay)', color: 'var(--text-muted)', padding: '8px 16px',
        border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)',
        cursor: 'not-allowed', fontWeight: 600, fontFamily: 'var(--font-body)'
    }
};

export default ProblemCatalog;
