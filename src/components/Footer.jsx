export default function Footer() {
    return (
        <div className="footer-container">
            <div>© 2026 HubEntertain</div>
            <div className="footer-links">
                {['About us', 'Privacy', 'Terms', 'Help center'].map((t) => <span key={t}>{t}</span>)}
            </div>
        </div>
    );
}