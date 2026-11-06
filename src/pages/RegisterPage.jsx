import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout, { Field } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { user, register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to="/" replace />;

    const bind = (name) => ({
        name,
        value: form[name],
        onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) return setError('Passwords do not match');

        setSubmitting(true);
        try {
            await register(form);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            heroTitle={<>One hub.<br />Endless ways<br />to feel something.</>}
            eyebrow="The good stuff starts here"
            title="Find your next favorite."
            subtitle="Create your account. A whole world of entertainment, all in one place."
            tagline="Free to discover. Yours to explore."
        >
            <form onSubmit={handleSubmit}>
                {error && <div className="form-error">{error}</div>}

                <Field label="Full Name" icon="user" placeholder="Your full name" autoComplete="name" {...bind('fullName')} />
                <Field label="Email" icon="mail" type="email" placeholder="you@example.com" autoComplete="email" {...bind('email')} />
                <Field label="Password" icon="lock" type="password" placeholder="Create a password" autoComplete="new-password" {...bind('password')} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '-8px 0 16px' }}>Use at least 8 characters with a number.</p>
                <Field label="Confirm Password" icon="lock" type="password" placeholder="Re-enter your password" autoComplete="new-password" {...bind('confirmPassword')} />

                <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={submitting}>
                    <span>→</span> {submitting ? 'Creating account…' : 'Register'}
                </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
                Already have an account? <Link to="/login" className="link-primary">Login</Link>
            </p>
        </AuthLayout>
    );
}
