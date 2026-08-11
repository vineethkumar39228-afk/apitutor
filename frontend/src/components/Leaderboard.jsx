import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetching from the Redis-cached endpoint using custom api client
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

    // Helper function to assign medals to the top 3
    const getRankBadge = (index) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return <span style={{ padding: '0 8px', color: '#64748b' }}>{index + 1}</span>;
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2 style={{ margin: 0, color: '#0f172a' }}>Global Leaderboard</h2>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Top students by completed problems.
                </p>
            </header>

            {error && <div style={{ color: 'red', marginBottom: '15px' }}>⚠️ {error}</div>}

            <div style={styles.listContainer}>
                {/* Render Skeletons if loading */}
                {isLoading ? (
                    // Create an array of 10 empty items to render the skeleton structure
                    Array.from(new Array(10)).map((_, index) => (
                        <div key={index} className="skeleton-row" style={{ display: 'flex', alignItems: 'center', padding: '10px 15px' }}>
                            <div style={{ height: '20px', width: '30px', borderRadius: '4px', backgroundColor: '#e2e8f0', marginRight: '15px' }}></div>
                            <div style={{ height: '20px', width: '40%', borderRadius: '4px', backgroundColor: '#e2e8f0' }}></div>
                            <div style={{ height: '20px', width: '60px', borderRadius: '4px', backgroundColor: '#e2e8f0', marginLeft: 'auto' }}></div>
                        </div>
                    ))
                ) : (
                    /* Render Actual Data if loaded */
                    leaderboardData.length > 0 ? (
                        leaderboardData.map((user, index) => (
                            <div
                                key={user.userId}
                                style={{
                                    ...styles.row,
                                    backgroundColor: index === 0 ? '#fffbeb' : index === 1 ? '#f8fafc' : index === 2 ? '#fff1f2' : 'white',
                                    border: index === 0 ? '1px solid #fde68a' : '1px solid #e2e8f0'
                                }}
                            >
                                <div style={styles.rankCol}>
                                    {getRankBadge(index)}
                                </div>

                                <div style={styles.nameCol}>
                                    <strong>{user.name}</strong>
                                </div>

                                <div style={styles.scoreCol}>
                                    <span style={styles.scoreNumber}>{user.totalSolved}</span>
                                    <span style={styles.scoreLabel}> solved</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                            No data available yet. Be the first to solve a problem!
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

// --- Component Styling ---
const styles = {
    container: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '25px',
        maxWidth: '500px',
        margin: '0 auto',
        fontFamily: 'sans-serif'
    },
    header: {
        marginBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '15px'
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 15px',
        borderRadius: '8px',
        transition: 'transform 0.1s ease',
    },
    rankCol: {
        width: '40px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    nameCol: {
        flex: 1,
        paddingLeft: '10px',
        color: '#334155'
    },
    scoreCol: {
        textAlign: 'right'
    },
    scoreNumber: {
        fontWeight: '900',
        color: '#0ea5e9',
        fontSize: '1.1rem'
    },
    scoreLabel: {
        color: '#64748b',
        fontSize: '0.85rem'
    }
};

export default Leaderboard;
