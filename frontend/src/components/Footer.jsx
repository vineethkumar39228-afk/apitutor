import React from 'react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p>&copy; {new Date().getFullYear()} My Project. All rights reserved.</p>
            </div>
        </footer>
    );
}
