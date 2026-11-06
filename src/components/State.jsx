export function Loading({ text = 'Loading…' }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-box">
      <p>{error?.message || 'Something went wrong.'}</p>
      {onRetry && <button className="btn-soft" onClick={onRetry}>Try again</button>}
    </div>
  );
}
