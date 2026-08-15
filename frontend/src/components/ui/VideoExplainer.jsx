import React from 'react';

/**
 * VideoExplainer - Embeds a YouTube video by video ID.
 * Usage: <VideoExplainer videoId="dQw4w9WgXcQ" />
 */
const VideoExplainer = ({ videoId, title = 'Video Explanation' }) => {
    if (!videoId) return null;

    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.header}>
                <span style={{ fontSize: '1.1rem' }}>🎬</span>
                <h4 style={styles.title}>{title}</h4>
            </div>
            <div style={styles.videoWrapper}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={styles.iframe}
                    loading="lazy"
                />
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: 'var(--surface-raised)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginTop: '20px',
        boxShadow: 'var(--shadow-md)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
    },
    title: {
        margin: 0,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-heading)',
        fontSize: '1rem',
    },
    videoWrapper: {
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 aspect ratio
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
    },
    iframe: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: 'var(--radius-md)',
    },
};

export default VideoExplainer;
