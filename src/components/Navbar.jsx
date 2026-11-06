import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { api } from '../lib/api';
import Icon from './Icon';

function NavLinks({ links, onNavigate }) {
    return links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className="nav-link" onClick={onNavigate}>
            {l.label}
        </NavLink>
    ));
}

export default function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const categories = useCategories();

    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [popular, setPopular] = useState([]);
    const [result, setResult] = useState({ q: '', items: [] });
    const userMenuRef = useRef(null);

    const links = [
        { to: '/', label: 'All', end: true },
        ...categories.map((c) => ({ to: `/category/${c.slug}`, label: c.pageTitle })),
    ];

    // Tutup dropdown user saat klik di luar
    useEffect(() => {
        if (!userMenuOpen) return;
        const onClick = (e) => !userMenuRef.current?.contains(e.target) && setUserMenuOpen(false);
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [userMenuOpen]);

    // Saran "Popular" di popup mobile: judul pertama dari tiap kategori
    useEffect(() => {
        if (!popupOpen || popular.length) return;
        api.get('/home', { params: { limit: 1 } })
            .then((d) => setPopular(d.sections.flatMap((s) => s.items)))
            .catch(() => { });
    }, [popupOpen, popular.length]);

    // Live search di popup mobile (debounce 250ms)
    const q = query.trim();
    useEffect(() => {
        if (!popupOpen || !q) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            api.get('/contents/search', { params: { q, limit: 6 }, signal: controller.signal })
                .then((d) => setResult({ q, items: d.results }))
                .catch(() => { });
        }, 250);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [q, popupOpen]);

    const submitSearch = (e) => {
        e.preventDefault();
        if (!q) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
        setPopupOpen(false);
        setMenuOpen(false);
    };

    const openItem = (id) => {
        navigate(`/detail/${id}`);
        setPopupOpen(false);
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const searching = q && result.q !== q;
    const shown = q ? (searching ? [] : result.items) : popular;
    const label = !q ? 'Popular right now' : searching ? 'Searching…' : shown.length ? 'Results' : `No results for "${query}"`;

    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <Link to="/" className="brand">
                        <div className="logo-box"><Icon name="play" size={16} /></div>
                        HubEntertain
                    </Link>

                    <div className="desktop-menu nav-links"><NavLinks links={links} /></div>
                </div>

                <div className="navbar-right">
                    <form className="desktop-search-input search-box" onSubmit={submitSearch}>
                        <Icon name="search" size={15} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>

                    <button className="icon-btn mobile-search-btn" onClick={() => setPopupOpen(true)} aria-label="Search">
                        <Icon name="search" size={16} />
                    </button>

                    {user ? (
                        <div className="user-menu" ref={userMenuRef}>
                            <button className="avatar nav-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)} title={user.fullName}>
                                {user.initials}
                            </button>
                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-info">
                                        <strong>{user.fullName}</strong>
                                        <span>{user.email}</span>
                                    </div>
                                    <button onClick={handleLogout}>Log out</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary btn-sm nav-login">Login</Link>
                    )}

                    <button className="icon-btn mobile-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                        <Icon name={menuOpen ? 'close' : 'menu'} />
                    </button>
                </div>

                {menuOpen && (
                    <div className="mobile-menu">
                        <NavLinks links={links} onNavigate={() => setMenuOpen(false)} />
                    </div>
                )}
            </nav>

            {popupOpen && (
                <div className="search-popup-overlay">
                    <form onSubmit={submitSearch} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="search-box" style={{ flex: 1 }}>
                            <Icon name="search" size={18} />
                            <input
                                type="text"
                                autoFocus
                                className="search-input"
                                placeholder="Search movies, shows, artists..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setPopupOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 8 }}
                        >
                            Cancel
                        </button>
                    </form>

                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{label}</div>

                    <div>
                        {shown.map((item) => (
                            <div key={item.id} className="suggestion" onClick={() => openItem(item.id)}>
                                <img src={item.image} alt="" />
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{item.type} • {item.year}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
