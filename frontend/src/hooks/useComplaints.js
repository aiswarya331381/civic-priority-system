import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useComplaints(endpoint = '/complaints/all', deps = []) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params });
      setComplaints(res.data.complaints);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetch(); }, deps);

  return { complaints, setComplaints, loading, error, refetch: fetch };
}
