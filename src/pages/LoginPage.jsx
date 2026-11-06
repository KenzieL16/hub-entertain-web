import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout, { Field } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const from = useLocation().state?.from || '/';

    const [form, setForm] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to={from} replace />;

    const bind = (name) => ({
        name,
        value: form[name],
        onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login({ ...form, rememberMe });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            heroTitle={<>Great stories.<br />Even better<br />when you return.</>}
            eyebrow="Good to see you again"
            title="Welcome back."
            subtitle="Your world of entertainment is waiting."
            tagline="Your favorites. Your world. Securely yours."
        >
            <form onSubmit={handleSubmit}>
                {error && <div className="form-error">{error}</div>}

                <Field label="Email" icon="mail" type="email" placeholder="name@example.com" autoComplete="email" {...bind('email')} />
                <Field label="Password" icon="lock" type="password" autoComplete="current-password" {...bind('password')} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 28px', fontSize: 13 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-soft)' }}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ accentColor: '#2563EB', width: 16, height: 16 }}
                        />
                        Remember Me
                    </label>
                    <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Forgot Password?</span>
                </div>

                <button type="submit" className="btn-primary" disabled={submitting}>
                    <span>→</span> {submitting ? 'Logging in…' : 'Login'}
                </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
                New to HubEntertain? <Link to="/register" className="link-primary">Register</Link>
            </p>
        </AuthLayout>
    );
}
