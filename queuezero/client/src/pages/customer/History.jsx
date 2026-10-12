import { useEffect, useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { useNotify } from '../../context/NotificationContext';

const statusBadge = {
  completed: 'badge-success',
  cancelled: 'badge-danger',
  skipped: 'badge-warning',
};

const History = () => {
  const notify = useNotify();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/queue/history')
      .then(({ data }) => setHistory(data))
      .catch((err) => notify(err.response?.data?.message || 'Could not load history', 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <PageHeader
          eyebrow="Past visits"
          title="Queue history"
          description="A record of every queue you've joined, completed, or cancelled."
        />

        {loading ? (
          <Loader label="Loading history..." />
        ) : history.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No history yet"
            description="Once you've completed or cancelled a queue, it will show up here."
          />
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Service</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>#{String(h.tokenNumber).padStart(3, '0')}</td>
                    <td>{h.service?.name}</td>
                    <td>{h.service?.department}</td>
                    <td>
                      <span className={`badge ${statusBadge[h.status] || 'badge-neutral'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td>{new Date(h.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};

export default History;
