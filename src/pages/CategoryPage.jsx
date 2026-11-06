import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Footer from '../components/Footer';
import { ErrorState, Loading } from '../components/State';
import { useFetch } from '../hooks/useFetch';
import { api } from '../lib/api';

const SORTS = { rating: 'Top rated', newest: 'Newest', title: 'A – Z' };

export default function CategoryPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [sort, setSort] = useState('rating');

    // Genre terpilih milik satu kategori; pindah kategori otomatis kembali ke "All"
    const [filter, setFilter] = useState({ slug, genre: 'All' });
    const genre = filter.slug === slug ? filter.genre : 'All';
    const setGenre = (g) => setFilter({ slug, genre: g });

    const { data, loading, error, reload } = useFetch(
        (signal) =>
            api.get(`/categories/${slug}`, {
                params: { genre: genre === 'All' ? undefined : genre, sort, limit: 100 },
                signal,
            }),
        [slug, genre, sort]
    );

    if (error?.status === 404) return <Navigate to="/" replace />;
    if (error) return <div className="page"><ErrorState error={error} onRetry={reload} /></div>;
    // data milik kategori sebelumnya? tampilkan loading sampai data baru datang
    if (!data || data.category.slug !== slug) return <div className="page">{loading && <Loading />}</div>;

    const { category: cat, genres, items, pagination } = data;

    return (
        <div className="page">
            <div className="page-container">
                <div className="breadcrumb">
                    <Link to="/" className="back-link">Home</Link> {'>'} {cat.pageTitle}
                </div>

                <div className="category-header">
                    <div>
                        <h1 className="detail-title" style={{ marginTop: 0 }}>{cat.pageTitle}</h1>
                        <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                            {cat.description} <span style={{ color: 'var(--text-dim)' }}>• {pagination.total} titles</span>
                        </p>
                    </div>

                    <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                        {Object.entries(SORTS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="chip-row">
                    {['All', ...genres].map((g) => (
                        <button key={g} className={`chip ${g === genre ? 'active' : ''}`} onClick={() => setGenre(g)}>
                            {g}
                        </button>
                    ))}
                </div>

                <div className="content-grid">
                    {items.map((item) => (
                        <Card
                            key={item.id}
                            item={item}
                            square={cat.square}
                            showPlay={cat.showPlay}
                            onClick={() => navigate(`/detail/${item.id}`)}
                        />
                    ))}
                </div>

                {items.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '60px 0' }}>
                        Belum ada judul di genre ini.
                    </p>
                )}
            </div>

            <Footer />
        </div>
    );
}