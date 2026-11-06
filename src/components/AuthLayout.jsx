import { useState } from 'react';
import Astronaut from '../assets/login-bg.svg';
import Icon from './Icon';

export function Field({ label, icon, type = 'text', ...inputProps }) {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="form-field">
            <label className="form-label">{label}</label>
            <div className="input-group">
                <Icon name={icon} className="input-icon-left" />
                <input
                    type={isPassword && show ? 'text' : type}
                    className="custom-input"
                    required
                    {...inputProps}
                />
                {isPassword && (
                    <div className="input-icon-right" onClick={() => setShow(!show)}>
                        <Icon name="eye" />
                    </div>
                )}
            </div>
        </div>
    );
}

/** Layout dua kolom (banner kiri + form kanan) untuk Login & Register. */
export default function AuthLayout({ heroTitle, eyebrow, title, subtitle, tagline, children }) {
    return (
        <div className="auth-container">
            <div className="auth-hero">
                <img src={Astronaut} alt="Astronaut Background" className="hero-bg" />
                <div className="hero-overlay" />

                <div className="auth-hero-content">
                    <div className="pill-badge">
                        <Icon name="star" size={12} />
                        <span>Your next obsession awaits</span>
                    </div>
                    <h1 className="auth-title">{heroTitle}</h1>
                    <p className="auth-desc">
                        Discover the films, series, and music that stay with you.<br />
                        Your next favorite is closer than you think.
                    </p>
                    <div className="auth-hero-footer">
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>Beyond the Blue</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>2026 • Sci-fi / Adventure</div>
                        </div>
                        <div className="dots"><i /><i /><i /></div>
                    </div>
                </div>
            </div>

            <div className="auth-form-wrapper">
                <div>
                    <div className="auth-header">
                        <div className="logo-box"><Icon name="play" size={20} /></div>
                        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>HubEntertain</span>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <span className="eyebrow">{eyebrow}</span>
                        <h2 style={{ fontSize: 32, fontWeight: 800, margin: '8px 0 6px' }}>{title}</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{subtitle}</p>
                    </div>

                    {children}
                </div>

                <div className="auth-footer-tagline">
                    <Icon name="clock" size={14} />
                    {tagline}
                </div>
            </div>
        </div>
    );
}
