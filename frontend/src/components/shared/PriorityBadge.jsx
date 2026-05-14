export default function PriorityBadge({ level, score }) {
  const styles = {
    critical: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: '🔴 Critical' },
    high:     { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa', label: '🟠 High' },
    medium:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: '🟡 Medium' },
    low:      { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '🟢 Low' },
  };
  const s = styles[level] || styles.low;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
      {score !== undefined && <span style={{ opacity: 0.75, fontWeight: 500 }}>({score})</span>}
    </span>
  );
}
