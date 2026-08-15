import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo / Brand Name */}
                <Link to="/" className="navbar-logo">
                    ⚡ APITutor
                </Link>

                {/* Navigation Links */}
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link
                            to="/dashboard"
                            className="nav-links"
                            style={isActive('/dashboard') ? activeStyle : {}}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/catalog"
                            className="nav-links"
                            style={isActive('/catalog') ? activeStyle : {}}
                        >
                            Problems
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/leaderboard"
                            className="nav-links"
                            style={isActive('/leaderboard') ? activeStyle : {}}
                        >
                            Leaderboard
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/login"
                            className="nav-links"
                            style={{
                                ...(isActive('/login') ? activeStyle : {}),
                                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                                color: '#fff',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600,
                            }}
                        >
                            Sign In
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

const activeStyle = {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--surface-overlay)',
};

export default Navbar;