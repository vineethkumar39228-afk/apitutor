import React from 'react';

export default function Footer() {
    return (
        <footer className="footer">
            <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>
                    © {new Date().getFullYear()} <strong style={{ color: 'var(--text-primary)' }}>APITutor</strong>. All rights reserved.
                </span>
                <span style={{ fontSize: '0.8rem' }}>
                    Built with ⚡ React + Express + MongoDB
                </span>
            </div>
        </footer>
    );
}
