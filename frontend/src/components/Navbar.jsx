import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo / Brand Name */}
                <Link to="/" className="navbar-logo">
                    APITutor
                </Link>

                {/* Navigation Links */}
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-links">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/catalog" className="nav-links">
                            Catalog
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/leaderboard" className="nav-links">
                            Leaderboard
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/docs" className="nav-links">
                            Docs
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/about" className="nav-links">
                            About
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/login" className="nav-links">
                            Login
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/register" className="nav-links">
                            Register
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;