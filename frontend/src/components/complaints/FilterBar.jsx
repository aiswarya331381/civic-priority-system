export default function FilterBar({ filters, onChange, count }) {
  return (
    <div className="filter-bar">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by title, description or location..."
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <select className="filter-select" value={filters.severity} onChange={e => onChange({ ...filters, severity: e.target.value })}>
        <option value="">All Severity</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select className="filter-select" value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
      <select className="filter-select" value={filters.sort} onChange={e => onChange({ ...filters, sort: e.target.value })}>
        <option value="-createdAt">Newest First</option>
        <option value="createdAt">Oldest First</option>
        <option value="-severity">Highest Severity</option>
      </select>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {count} result{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
