import Icon from './Icon';

export default function Card({ item, square = false, showPlay = false, onClick }) {
    return (
        <div className="scroll-item" onClick={onClick}>
            <div className={`card-poster ${square ? 'square' : ''}`}>
                <img src={item.image} alt={item.title} />
                <div className="card-badge">
                    <span className="star">★</span> {item.rating}
                </div>
                {showPlay && (
                    <div className="play-fab">
                        <Icon name="play" size={14} filled style={{ marginLeft: 1 }} />
                    </div>
                )}
            </div>
            <h4 className="card-title">{item.title}</h4>
            <p className="card-meta">{item.subtitle}</p>
        </div>
    );
}
