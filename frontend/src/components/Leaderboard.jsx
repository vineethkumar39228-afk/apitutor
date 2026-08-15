import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/analytics/leaderboard');
                setLeaderboardData(response.data.leaderboard);
            } catch (err) {
                setError('Unable to load leaderboard at this time.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankBadge = (index) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return <span style={{ padding: '0 8px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{index + 1}</span>;
        }
    };

    const getRowStyle = (index) => {
        const base = {
            ...styles.row,
            animationDelay: `${index * 60}ms`,
        };
        if (index === 0) return { ...base, background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))', border: '1px solid var(--brand-primary)' };
        if (index === 1) return { ...base, background: 'rgba(59,130,246,0.06)', border: '1px solid var(--surface-border)' };
        if (index === 2) return { ...base, background: 'rgba(139,92,246,0.06)', border: '1px solid var(--surface-border)' };
        return { ...base, border: '1px solid var(--surface-border)' };
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    🏆 Global Leaderboard
                </h2>
                <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Top students by completed problems.
                </p>
            </header>

            {error && (
                <div style={{ color: 'var(--brand-error)', marginBottom: '15px', padding: '12px', background: 'var(--brand-error-soft)', borderRadius: 'var(--radius-sm)' }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={styles.listContainer}>
                {isLoading ? (
                    Array.from(new Array(10)).map((_, index) => (
                        <div key={index} className="skeleton-row" style={{ display: 'flex', alignItems: 'center', padding: '10px 15px' }}>
                            <div style={{ height: '20px', width: '30px', borderRadius: '4px', backgroundColor: 'var(--surface-overlay)', marginRight: '15px' }}></div>
                            <div style={{ height: '20px', width: '40%', borderRadius: '4px', backgroundColor: 'var(--surface-overlay)' }}></div>
                            <div style={{ height: '20px', width: '60px', borderRadius: '4px', backgroundColor: 'var(--surface-overlay)', marginLeft: 'auto' }}></div>
                        </div>
                    ))
                ) : (
                    leaderboardData.length > 0 ? (
                        leaderboardData.map((user, index) => (
                            <div
                                key={user.userId}
                                style={getRowStyle(index)}
                                className="animate-slide-up"
                            >
                                <div style={styles.rankCol}>
                                    {getRankBadge(index)}
                                </div>

                                <div style={styles.nameCol}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
                                </div>

                                <div style={styles.scoreCol}>
                                    <span style={styles.scoreNumber}>{user.totalSolved || user.totalScore || 0}</span>
                                    <span style={styles.scoreLabel}> solved</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No data available yet. Be the first to solve a problem! 🚀
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--surface-border)',
        padding: '28px',
        maxWidth: '560px',
        margin: '0 auto',
        fontFamily: 'var(--font-body)'
    },
    header: {
        marginBottom: '24px',
        borderBottom: '1px solid var(--surface-border)',
        paddingBottom: '16px'
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        transition: 'all var(--transition-fast)',
    },
    rankCol: {
        width: '40px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    nameCol: {
        flex: 1,
        paddingLeft: '12px',
    },
    scoreCol: {
        textAlign: 'right'
    },
    scoreNumber: {
        fontWeight: 800,
        color: 'var(--brand-primary)',
        fontSize: '1.1rem',
        fontFamily: 'var(--font-heading)'
    },
    scoreLabel: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
    }
};

export default Leaderboard;
