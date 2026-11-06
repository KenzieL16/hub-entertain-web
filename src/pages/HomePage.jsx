import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { ErrorState, Loading } from '../components/State';
import { useFetch } from '../hooks/useFetch';
import { api } from '../lib/api';

export default function HomePage() {
    const navigate = useNavigate();
    const { data, loading, error, reload } = useFetch(
        (signal) => api.get('/home', { params: { limit: 10 }, signal }),
        []
    );

    if (error) return <div className="page"><ErrorState error={error} onRetry={reload} /></div>;
    if (!data) return <div className="page">{loading && <Loading />}</div>;

    const { hero, sections } = data;
    const goDetail = (id) => () => navigate(`/detail/${id}`);

    return (
        <div className="page">
            {hero && (
                <section className="home-hero">
                    <img src={hero.image} alt={hero.title} className="hero-bg" />
                    <div className="hero-overlay" />

                    <div className="hero-content">
                        <div className="pill-badge">
                            <Icon name="star" size={10} />
                            <span>#1 Trending this week</span>
                        </div>

                        <h1 className="hero-title">{hero.title}</h1>

                        <div className="hero-meta">
                            <span className="star" style={{ fontWeight: 700 }}>★ {hero.rating}</span>
                            {[hero.year, hero.duration, hero.genre, hero.rated].filter(Boolean).map((t, i) => (
                                <span key={i} style={{ display: 'contents' }}>
                                    {i > 0 && <span>•</span>}
                                    <span>{t}</span>
                                </span>
                            ))}
                        </div>

                        <p className="hero-synopsis">{hero.synopsis}</p>

                        <div className="hero-buttons-wrapper">
                            <button className="btn-primary btn-sm" onClick={goDetail(hero.id)}>
                                <Icon name="play" size={14} filled /> Watch Trailer
                            </button>
                            <button className="btn-light" onClick={goDetail(hero.id)}>
                                <span>↗</span> Explore movie
                            </button>
                        </div>
                    </div>

                    <div className="hero-slider-control">
                        <span>01/04</span>
                        <div className="hero-slider-track"><i /></div>
                        <span style={{ cursor: 'pointer', color: 'var(--text)' }}>&gt;</span>
                    </div>
                </section>
            )}

            <div className="page-container stack-48">
                {sections.map((section) => (
                    <div key={section.slug}>
                        <div className="section-header">
                            <h2 className="section-title">{section.title}</h2>
                            <span className="view-all" onClick={() => navigate(`/category/${section.slug}`)}>View all →</span>
                        </div>
                        <div className="horizontal-scroll-container">
                            {section.items.map((item) => (
                                <Card
                                    key={item.id}
                                    item={item}
                                    square={section.square}
                                    showPlay={section.showPlay}
                                    onClick={goDetail(item.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    );
}
