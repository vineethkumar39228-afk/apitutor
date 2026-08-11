import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ProblemCatalog = () => {
    // State for data and pagination
    const [problems, setProblems] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    const navigate = useNavigate();

    // Function to fetch data based on current state
    const fetchProblems = useCallback(async (pageToFetch = 1) => {
        setIsLoading(true);
        setError('');

        try {
            // Build the query string dynamically
            const params = new URLSearchParams({
                page: pageToFetch,
                limit: 10,
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

    // Fetch initial data on mount
    useEffect(() => {
        fetchProblems(1);
    }, []); // Run once on mount. We use a manual button trigger for searches.

    // Handlers
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProblems(1); // Reset to page 1 on new search
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setTopicFilter('');
        setDifficultyFilter('');
        setTimeout(() => fetchProblems(1), 0);
    };

    // Helper for difficulty colors
    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return { bg: '#dcfce7', text: '#166534' };
            case 'medium': return { bg: '#fef9c3', text: '#854d0e' };
            case 'hard': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>Problem Catalog</h1>
                <p style={{ color: '#64748b' }}>Browse and search for math problems to practice.</p>
            </header>

            {/* --- Filter & Search Controls --- */}
            <form onSubmit={handleSearchSubmit} style={styles.filterSection}>

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
                    <option value="Algebra">Algebra</option>
                    <option value="Calculus">Calculus</option>
                    <option value="Fractions">Fractions</option>
                    <option value="General Math">General Math</option>
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
            {error && <div style={{ color: 'red', margin: '20px 0' }}>⚠️ {error}</div>}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
                    <h3>Loading problems...</h3>
                </div>
            ) : (
                <div style={styles.grid}>
                    {problems && problems.length > 0 ? (
                        problems.map((problem) => {
                            const diffStyle = getDifficultyColor(problem.difficulty);
                            return (
                                <div key={problem._id} style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <span style={styles.topicBadge}>{problem.topic || 'General Math'}</span>
                                        <span style={{
                                            ...styles.difficultyBadge,
                                            backgroundColor: diffStyle.bg,
                                            color: diffStyle.text
                                        }}>
                                            {problem.difficulty || 'Medium'}
                                        </span>
                                    </div>

                                    <h3 style={{ margin: '15px 0 5px 0', color: '#0f172a' }}>{problem.title}</h3>
                                    <div role="math" aria-label={`Equation: ${problem.originalEquation || problem.title}`}>
                                        <span className="sr-only">{problem.originalEquation || problem.title}</span>
                                        <code aria-hidden="true" style={styles.equationDisplay}>{problem.originalEquation}</code>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/problem/${problem._id}`)}
                                        style={{ ...styles.primaryButton, width: '100%', marginTop: '20px' }}
                                    >
                                        Solve Problem
                                    </button>
                                </div>
                            )
                        })
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            No problems found matching your filters.
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

                    <span style={{ color: '#475569', fontWeight: 'bold' }}>
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

// --- Styling ---
const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' },
    header: { marginBottom: '30px' },
    filterSection: {
        display: 'flex', gap: '15px', flexWrap: 'wrap', backgroundColor: '#f8fafc',
        padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e2e8f0'
    },
    searchInput: { flex: 2, minWidth: '200px', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' },
    selectInput: { flex: 1, minWidth: '150px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' },
    primaryButton: { backgroundColor: '#0ea5e9', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    secondaryButton: { backgroundColor: '#e2e8f0', color: '#475569', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    topicBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
    difficultyBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
    equationDisplay: { display: 'block', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #0ea5e9', color: '#334155', marginTop: '10px', overflowX: 'auto' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' },
    pageButton: { backgroundColor: '#ffffff', color: '#0ea5e9', padding: '8px 16px', border: '1px solid #0ea5e9', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
    pageButtonDisabled: { backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 'bold' }
};

export default ProblemCatalog;
