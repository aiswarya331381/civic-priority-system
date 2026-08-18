export default function PriorityBadge({ level, score }) {
  const styles = {
    critical: { bg: 'var(--red-bg)',    color: 'var(--red)',    border: 'var(--red-border)',    label: '🔴 Critical' },
    high:     { bg: 'var(--orange-bg)', color: 'var(--orange)', border: 'var(--orange-border)', label: '🟠 High' },
    medium:   { bg: 'var(--yellow-bg)', color: 'var(--yellow)', border: 'var(--yellow-border)', label: '🟡 Medium' },
    low:      { bg: 'var(--green-bg)',  color: 'var(--green)',  border: 'var(--green-border)',  label: '🟢 Low' },
  };
  const s = styles[level] || styles.low;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
      {score !== undefined && <span style={{ opacity: 0.75, fontWeight: 500 }}>({score})</span>}
    </span>
  );
}
