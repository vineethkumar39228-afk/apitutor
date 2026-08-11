import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [analytics, setAnalytics] = useState(null); // NEW: State for charting data
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch both user data and analytics in parallel using custom api instance
                const [userRes, analyticsRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/analytics/dashboard')
                ]);

                setUserData(userRes.data);
                setAnalytics(analyticsRes.data);
            } catch (err) {
                setError('Failed to load dashboard data. Please try logging in again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div style={styles.centerContainer}><h2>Loading your dashboard...</h2></div>;
    }

    if (error) {
        return <div style={styles.centerContainer}><h2 style={{ color: 'red' }}>⚠️ {error}</h2></div>;
    }

    // Safely extract the overall stats, defaulting to 0 if they haven't started anything
    const { overall, mastery } = analytics || {};
    const { totalStarted = 0, totalCompleted = 0, accuracyRate = 0 } = overall || {};

    return (
        <div className="responsive-dashboard">

            {/* Sidebar */}
            <aside className="responsive-sidebar">
                <h2 style={styles.brand}>AI Tutor</h2>
                <nav style={styles.nav}>
                    <Link to="/dashboard" style={styles.navItemActive}>Dashboard</Link>
                    <Link to="/catalog" style={styles.navItem}>Problem Sets</Link>
                    <Link to="/leaderboard" style={styles.navItem}>Leaderboard</Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="responsive-main">

                <header style={styles.header}>
                    <h1>Welcome back, {userData?.name || 'Student'}! 👋</h1>
                    <p style={styles.subtitle}>Here is an overview of your learning journey.</p>
                </header>

                {/* Top Level KPIs */}
                <section style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h4 style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Problems Attempted</h4>
                        <span style={styles.statNumber}>{totalStarted}</span>
                    </div>
                    <div style={styles.statCard}>
                        <h4 style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Problems Solved</h4>
                        <span style={styles.statNumber}>{totalCompleted}</span>
                    </div>
                    <div style={styles.statCard}>
                        <h4 style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Overall Accuracy</h4>
                        <span style={{ ...styles.statNumber, color: accuracyRate > 75 ? '#22c55e' : '#f59e0b' }}>
                            {accuracyRate}%
                        </span>
                    </div>
                </section>

                {/* Topic Mastery Chart */}
                <section style={{ ...styles.card, marginTop: '30px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#f8fafc' }}>Topic Mastery Breakdown</h3>

                    {mastery && mastery.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={mastery} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />

                                    <XAxis
                                        dataKey="topic"
                                        tick={{ fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                        tick={{ fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        cursor={{ fill: '#334155' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc' }}
                                        formatter={(value) => [`${value}%`, 'Mastery Score']}
                                    />

                                    <Bar dataKey="masteryScore" radius={[4, 4, 0, 0]}>
                                        {mastery.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.masteryScore > 80 ? '#22c55e' : entry.masteryScore > 50 ? '#38bdf8' : '#64748b'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>
                            Complete some practice problems to unlock your mastery charts!
                        </p>
                    )}
                </section>

            </main>
        </div>
    );
};

// --- Styles ---
const styles = {
    dashboardContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', color: '#f8fafc' },
    sidebar: { width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' },
    brand: { margin: '0 0 30px 0', fontSize: '1.5rem', color: '#38bdf8' },
    nav: { display: 'flex', flexDirection: 'column', gap: '10px' },
    navItem: { color: '#cbd5e1', textDecoration: 'none', padding: '10px', borderRadius: '4px', transition: 'background 0.2s' },
    navItemActive: { color: '#ffffff', textDecoration: 'none', padding: '10px', borderRadius: '4px', backgroundColor: '#334155', fontWeight: 'bold' },
    mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { marginBottom: '30px' },
    subtitle: { color: '#94a3b8', fontSize: '1.1rem', marginTop: '5px' },
    card: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    statCard: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' },
    statNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '10px' },
    centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#f8fafc' }
};

export default Dashboard;
