export const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtFull = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const stLabel = (s) => ({ pending: 'Pending', 'in-progress': 'In Progress', resolved: 'Resolved' }[s] || s);
export const sevClass = (s) => ({ low: 'badge-low', medium: 'badge-medium', high: 'badge-high', critical: 'badge-critical' }[s] || '');
export const stClass = (s) => ({ pending: 'badge-pending', 'in-progress': 'badge-inprog', resolved: 'badge-resolved' }[s] || '');
export const sevOrder = { critical: 4, high: 3, medium: 2, low: 1 };
