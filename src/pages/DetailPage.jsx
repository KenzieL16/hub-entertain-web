import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { ErrorState, Loading } from '../components/State';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { api } from '../lib/api';
import { timeAgo } from '../lib/format';

const MAX_REVIEW = 1000;
const PAGE_SIZE = 5;

function Review({ rev, onDelete }) {
    return (
        <div className="panel review-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="avatar">{rev.user.avatar}</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{rev.user.name}{rev.isMine && ' (you)'}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{timeAgo(rev.createdAt)}</div>
                    </div>
                </div>
                <div className="star-blue" style={{ fontSize: 12 }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                </div>
            </div>
            {rev.title && <h4 style={{ fontSize: 13, fontWeight: 600, margin: '8px 0 4px' }}>{rev.title}</h4>}
            <p style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.5 }}>{rev.comment}</p>
            {rev.isMine && (
                <button className="link-button" onClick={() => onDelete(rev)}>Delete</button>
            )}
        </div>
    );
}

export default function DetailPage() {
    const { id } = useParams();
    // key: pindah ke judul lain membuat ulang komponen, jadi semua state ikut ter-reset
    return <DetailContent key={id} id={id} />;
}

function DetailContent({ id }) {
    const location = useLocation();
    const { user } = useAuth();

    const { data, loading, error, reload } = useFetch(
        (signal) => api.get(`/contents/${id}`, { signal }),
        [id]
    );

    const [isFavorite, setIsFavorite] = useState(false);

    // ----- review list -----
    // `key` menandai review milik siapa yang sedang ditampung; beda key = masih memuat.
    const userKey = user?.id ?? 'guest';
    const [rv, setRv] = useState({ key: null, reviews: [], summary: { count: 0, average: 0 }, pagination: null });
    const reviewsLoading = rv.key !== userKey;
    const { reviews, summary, pagination } = rv;

    useEffect(() => {
        let cancelled = false;
        api.get(`/contents/${id}/reviews`, { params: { page: 1, limit: PAGE_SIZE } })
            .then((d) => {
                if (!cancelled) setRv({ key: userKey, reviews: d.reviews, summary: d.summary, pagination: d.pagination });
            })
            .catch(() => {
                if (!cancelled) setRv({ key: userKey, reviews: [], summary: { count: 0, average: 0 }, pagination: null });
            });
        return () => { cancelled = true; };
    }, [id, userKey]); // ulangi saat login/logout agar `isMine` benar

    const [loadingMore, setLoadingMore] = useState(false);
    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const d = await api.get(`/contents/${id}/reviews`, { params: { page: pagination.page + 1, limit: PAGE_SIZE } });
            setRv((s) => ({ ...s, reviews: [...s.reviews, ...d.reviews], summary: d.summary, pagination: d.pagination }));
        } finally {
            setLoadingMore(false);
        }
    };

    // ----- review form -----
    // `draft` hanya berisi yang sedang diketik; selebihnya diambil dari review milik sendiri (jika ada).
    const mine = reviewsLoading ? undefined : reviews.find((r) => r.isMine);
    const [draft, setDraft] = useState({});
    const rating = draft.rating ?? mine?.rating ?? 4;
    const text = draft.text ?? mine?.comment ?? '';
    const setRating = (value) => setDraft((d) => ({ ...d, rating: value }));
    const setText = (value) => setDraft((d) => ({ ...d, text: value }));

    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submitReview = async () => {
        setFormError('');
        setSubmitting(true);
        try {
            const body = { rating, comment: text.trim() };
            if (mine) {
                const d = await api.patch(`/reviews/${mine.id}`, body);
                setRv((s) => ({ ...s, reviews: s.reviews.map((r) => (r.id === mine.id ? d.review : r)), summary: d.summary }));
            } else {
                const d = await api.post(`/contents/${id}/reviews`, body);
                setRv((s) => ({ ...s, reviews: [d.review, ...s.reviews], summary: d.summary }));
            }
            setDraft({});
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteReview = async (rev) => {
        if (!window.confirm('Delete your review?')) return;
        try {
            const d = await api.delete(`/reviews/${rev.id}`);
            setRv((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== rev.id), summary: d.summary }));
            setDraft({});
        } catch (err) {
            setFormError(err.message);
        }
    };

    // ----- render -----
    if (error?.status === 404) {
        return (
            <div className="page">
                <div className="state-box">
                    <p>This title could not be found.</p>
                    <Link to="/" className="btn-primary btn-sm nav-login">Back to Home</Link>
                </div>
            </div>
        );
    }
    if (error) return <div className="page"><ErrorState error={error} onRetry={reload} /></div>;

    const item = data?.content;
    if (!item || item.id !== id) return <div className="page">{loading && <Loading />}</div>;

    const hasMore = pagination && pagination.page < pagination.pages;

    return (
        <div className="page">
            <div className="page-container">
                <div className="breadcrumb">{item.breadcrumb}</div>

                {/* PLAYER */}
                <div className="panel detail-player-container">
                    <img src={item.image} alt={item.title} />
                    <div className="hero-overlay" />

                    <div className="player-bar top">
                        <span>OFFICIAL TRAILER</span>
                        <span>{item.badge}</span>
                    </div>

                    <div className="player-center">
                        <div className="play-big"><Icon name="play" size={24} filled style={{ marginLeft: 3 }} /></div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 12 }}>
                            Watch Trailer • {item.trailerTime}
                        </span>
                    </div>

                    <div className="player-bar bottom">
                        <Icon name="volume" size={16} />
                        <div>0:00 / {item.trailerTime}</div>
                    </div>
                </div>

                {/* HEADER */}
                <div className="detail-header">
                    <div>
                        <span className="eyebrow" style={{ fontSize: 10 }}>{item.tag}</span>
                        <h1 className="detail-title">{item.title}</h1>
                        <div className="detail-meta">
                            <span>{item.year}</span>
                            <span>•</span>
                            <span>{item.duration || item.info}</span>
                        </div>
                        <div className="genre-pills">
                            {item.genres?.map((g) => <span key={g} className="genre-pill">{g}</span>)}
                        </div>
                    </div>

                    <div className="detail-actions">
                        <button className={`btn-soft ${isFavorite ? 'active' : ''}`} onClick={() => setIsFavorite(!isFavorite)}>
                            <span>{isFavorite ? '♥' : '♡'}</span> {isFavorite ? 'Favorited' : 'Add to Favorites'}
                        </button>
                        <button className="btn-soft"><Icon name="share" size={14} /> Share</button>
                        <div className="rating-box">
                            <span className="star" style={{ fontSize: 18 }}>☆</span>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{item.rating}</div>
                                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{item.ratingsCount}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-layout-grid">
                    {/* KIRI: SINOPSIS + REVIEW */}
                    <div>
                        <div style={{ marginBottom: 40 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{item.tagline}</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 24 }}>{item.synopsis}</p>

                            <div className="credits">
                                {item.credits.map(({ label, value }) => (
                                    <div key={label}>
                                        <div className="credit-label">{label}</div>
                                        <div className="credit-value">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>The community says</h3>
                        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 20 }}>
                            {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
                            {summary.count > 0 && ` • ${summary.average}/5 average`} • Real people, Real opinions.
                        </p>

                        {reviewsLoading ? (
                            <Loading text="Loading reviews…" />
                        ) : reviews.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '24px 0' }}>
                                No reviews yet. Be the first to share your thoughts.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {reviews.map((rev) => <Review key={rev.id} rev={rev} onDelete={deleteReview} />)}
                            </div>
                        )}

                        {hasMore && (
                            <button className="btn-outline" onClick={loadMore} disabled={loadingMore}>
                                {loadingMore ? 'Loading…' : 'Load more reviews'}
                            </button>
                        )}
                    </div>

                    {/* KANAN: FORM REVIEW */}
                    <div>
                        <div className="panel review-form">
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                                {mine ? 'Your review' : 'What did you think?'}
                            </h3>
                            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 20 }}>
                                {mine ? 'You can update or delete your review.' : 'The best discoveries start with a conversation.'}
                            </p>

                            <div className="form-field" style={{ marginBottom: 20 }}>
                                <label className="form-label">Your rating</label>
                                <div className="star-picker" style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} className={s <= rating ? 'on' : ''} onClick={() => setRating(s)}>★</span>
                                    ))}
                                    <span style={{ fontSize: 12, color: 'var(--text-dim)', alignSelf: 'center', marginLeft: 'auto', cursor: 'default' }}>
                                        {rating}/5
                                    </span>
                                </div>
                            </div>

                            <div className="form-field" style={{ marginBottom: 20 }}>
                                <label className="form-label">Your review</label>
                                <textarea
                                    rows={4}
                                    maxLength={MAX_REVIEW}
                                    className="review-textarea"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="What stayed with you? Share your thoughts with the community..."
                                />
                                <div className="small-note" style={{ textAlign: 'right', marginTop: 4 }}>
                                    {text.length}/{MAX_REVIEW}
                                </div>
                            </div>

                            {formError && <div className="form-error">{formError}</div>}

                            {user ? (
                                <button className="btn-primary" onClick={submitReview} disabled={submitting || !text.trim()}>
                                    <span>→</span> {submitting ? 'Saving…' : mine ? 'Update Review' : 'Submit Review'}
                                </button>
                            ) : (
                                <Link to="/login" state={{ from: location.pathname }} className="btn-primary" style={{ textDecoration: 'none' }}>
                                    Log in to write a review
                                </Link>
                            )}

                            <div className="small-note" style={{ textAlign: 'center', marginTop: 12 }}>
                                Keep it real. Keep it spoiler-free.
                            </div>
                        </div>

                        <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 16 }}>
                            Your perspective could be someone's next great discovery.
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}