const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function timeAgo(iso) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  for (const [name, size] of UNITS) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
