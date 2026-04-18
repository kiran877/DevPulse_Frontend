import { useState, useEffect, useCallback } from 'react';
import { socket } from '../lib/socket';
import api from '../lib/axios';

/**
 * Custom hook for real-time DORA metrics for a single repo.
 *
 * Usage:
 *   const { metrics, history, loading, error } = useRepoMetrics('owner/repo');
 *
 * - On mount: fetches today's metrics + 30-day history via REST, then
 *   connects the socket and joins the repo's room.
 * - On 'metrics:update': replaces metrics state with the server-pushed snapshot.
 * - On unmount: leaves the room and disconnects the socket.
 */
export function useRepoMetrics(repoFullName) {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Fetch initial data via REST
  const fetchData = useCallback(async () => {
    if (!repoFullName) return;
    setLoading(true);
    setError(null);

    try {
      const [owner, repo] = repoFullName.split('/');

      const [todayRes, historyRes] = await Promise.all([
        api.get(`/api/metrics/${owner}/${repo}`),
        api.get(`/api/metrics/${owner}/${repo}/history?days=30`),
      ]);

      setMetrics(todayRes.data);
      setHistory(historyRes.data.history || []);
    } catch (err) {
      console.error('Failed to fetch metrics:', err.message);
      setError(err.response?.data?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [repoFullName]);

  useEffect(() => {
    if (!repoFullName) return;

    // Initial REST fetch
    fetchData();

    // Connect socket and join repo room
    socket.auth = { token: localStorage.getItem('devpulse_token') };
    socket.connect();

    socket.emit('join:repo', { repoFullName });

    // Real-time handler
    const handleMetricsUpdate = ({ repoFullName: updatedRepo, metrics: updatedMetrics }) => {
      if (updatedRepo === repoFullName) {
        setMetrics(updatedMetrics);
        // Append/replace today's entry in history
        setHistory((prev) => {
          const today = new Date().toISOString().split('T')[0];
          const idx = prev.findIndex(
            (h) => new Date(h.date).toISOString().split('T')[0] === today
          );
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = updatedMetrics;
            return updated;
          }
          return [...prev, updatedMetrics];
        });
      }
    };

    socket.on('metrics:update', handleMetricsUpdate);

    return () => {
      socket.emit('leave:repo', { repoFullName });
      socket.off('metrics:update', handleMetricsUpdate);
      socket.disconnect();
    };
  }, [repoFullName, fetchData]);

  return { metrics, history, loading, error, refetch: fetchData };
}
