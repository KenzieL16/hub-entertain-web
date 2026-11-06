import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import Footer from '../components/Footer';
import { ErrorState, Loading } from '../components/State';
import { useCategories } from '../hooks/useCategories';
import { useFetch } from '../hooks/useFetch';
import { api } from '../lib/api';

export default function SearchPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const q = params.get('q')?.trim() || '';
    const categories = useCategories();

    const { data, loading, error, reload } = useFetch(
        (signal) => (q ? api.get('/contents/search', { params: { q }, signal }) : Promise.resolve({ results: [] })),
        [q]
    );

    if (error) return <div className="page"><ErrorState error={error} onRetry={reload} /></div>;
    if (!data || (q && data.query !== q)) return <div className="page">{loading && <Loading />}</div>;

    const { results } = data;

    return (
        <div className="page">
            <div className="page-container">
                <div className="breadcrumb">Search</div>
                <h1 className="detail-title" style={{ marginTop: 0 }}>Results for “{q}”</h1>
                <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 32 }}>{results.length} titles found</p>

                {results.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '60px 0' }}>
                        Tidak ada hasil. Coba judul, nama artis, atau genre lain.
                    </p>
                )}

                <div className="stack-48">
                    {categories.map((cat) => {
                        const items = results.filter((r) => r.category === cat.slug);
                        if (!items.length) return null;
                        return (
                            <div key={cat.slug}>
                                <h2 className="section-title" style={{ marginBottom: 16 }}>{cat.pageTitle}</h2>
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
                            </div>
                        );
                    })}
                </div>
            </div>
            <Footer />
        </div>
    );
}
