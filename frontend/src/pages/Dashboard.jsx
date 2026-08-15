import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
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
        return (
            <div style={styles.centerContainer}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--surface-border)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Loading your dashboard...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centerContainer}>
                <div style={{ textAlign: 'center', padding: '32px', background: 'var(--brand-error-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--brand-error)' }}>
                    <h2 style={{ color: 'var(--brand-error)', fontFamily: 'var(--font-heading)' }}>⚠️ {error}</h2>
                </div>
            </div>
        );
    }

    const { overall, mastery } = analytics || {};
    const { totalStarted = 0, totalCompleted = 0, accuracyRate = 0 } = overall || {};

    return (
        <div className="responsive-dashboard">

            {/* Sidebar */}
            <aside className="responsive-sidebar">
                <h2 style={styles.brand}>⚡ AI Tutor</h2>
                <nav style={styles.nav}>
                    <Link to="/dashboard" style={styles.navItemActive}>📊 Dashboard</Link>
                    <Link to="/catalog" style={styles.navItem}>📚 Problem Sets</Link>
                    <Link to="/leaderboard" style={styles.navItem}>🏆 Leaderboard</Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="responsive-main">

                <header style={styles.header} className="animate-fade-in">
                    <h1 style={styles.title}>Welcome back, {userData?.name || 'Student'}! 👋</h1>
                    <p style={styles.subtitle}>Here is an overview of your learning journey.</p>
                </header>

                {/* Top Level KPIs */}
                <section style={styles.statsGrid} className="animate-slide-up">
                    <div style={styles.statCard}>
                        <h4 style={styles.statLabel}>Problems Attempted</h4>
                        <span style={styles.statNumber}>{totalStarted}</span>
                    </div>
                    <div style={styles.statCard}>
                        <h4 style={styles.statLabel}>Problems Solved</h4>
                        <span style={{ ...styles.statNumber, color: 'var(--brand-success)' }}>{totalCompleted}</span>
                    </div>
                    <div style={styles.statCard}>
                        <h4 style={styles.statLabel}>Overall Accuracy</h4>
                        <span style={{ ...styles.statNumber, color: accuracyRate > 75 ? 'var(--brand-success)' : 'var(--brand-warning)' }}>
                            {accuracyRate}%
                        </span>
                    </div>
                </section>

                {/* Topic Mastery Chart */}
                <section style={styles.chartCard} className="animate-slide-up">
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Topic Mastery Breakdown</h3>

                    {mastery && mastery.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={mastery} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />

                                    <XAxis
                                        dataKey="topic"
                                        tick={{ fill: 'var(--text-secondary)', fontFamily: 'Inter' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                        tick={{ fill: 'var(--text-secondary)', fontFamily: 'Inter' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface-raised)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--surface-border)',
                                            color: 'var(--text-primary)',
                                            fontFamily: 'Inter'
                                        }}
                                        formatter={(value) => [`${value}%`, 'Mastery Score']}
                                    />

                                    <Bar dataKey="masteryScore" radius={[6, 6, 0, 0]}>
                                        {mastery.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.masteryScore > 80 ? '#10B981' : entry.masteryScore > 50 ? '#3B82F6' : '#64748b'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                            Complete some practice problems to unlock your mastery charts!
                        </p>
                    )}
                </section>

            </main>
        </div>
    );
};

// --- Styles using tokens ---
const styles = {
    brand: { margin: '0 0 30px 0', fontSize: '1.5rem', fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    nav: { display: 'flex', flexDirection: 'column', gap: '6px' },
    navItem: { color: 'var(--text-secondary)', textDecoration: 'none', padding: '10px 12px', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)', fontSize: '0.95rem' },
    navItemActive: { color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-overlay)', fontWeight: 600, fontSize: '0.95rem' },
    header: { marginBottom: '30px' },
    title: { color: 'var(--text-primary)', fontSize: '2rem', margin: '0 0 8px 0', fontWeight: 700, fontFamily: 'var(--font-heading)' },
    subtitle: { color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '5px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    statCard: { background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', padding: '25px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', transition: 'all var(--transition-base)' },
    statLabel: { margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 },
    statNumber: { fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '10px', fontFamily: 'var(--font-heading)' },
    chartCard: { background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginTop: '30px' },
    centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }
};

export default Dashboard;
