import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const isSessionExpired = queryParams.get('session_expired');

    const from = location.state?.from?.pathname || '/dashboard';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const cleanEmail = email.trim().toLowerCase();
            const response = await api.post('/auth/login', {
                email: cleanEmail,
                password
            });

            // 1. Store the access token in LocalStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            // 2. Redirect to original destination or Dashboard
            navigate(from, { replace: true });

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
            <div className="auth-card">
                <h2>Login</h2>

                {isSessionExpired && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>
                        Your session has expired. Please log in again to continue.
                    </div>
                )}

                {error && <p style={{ color: 'red' }} className="auth-error">{error}</p>}
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="email" style={{ display: 'block' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="password" style={{ display: 'block' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={isLoading} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>
                <div className="auth-footer" style={{ marginTop: '1rem' }}>
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
