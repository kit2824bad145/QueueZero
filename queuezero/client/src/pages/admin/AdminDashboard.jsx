import { useEffect, useState } from 'react';
import {
  Users,
  Clock3,
  CheckCircle2,
  Hourglass,
  ListTodo,
  Building2,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import { useNotify } from '../../context/NotificationContext';

const AdminDashboard = () => {
  const notify = useNotify();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/statistics')
      .then(({ data }) => setStats(data))
      .catch((err) => notify(err.response?.data?.message || 'Could not load statistics', 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <PageHeader
          eyebrow="Overview"
          title="Today at a glance"
          description="A live snapshot of every queue running on QueueZero."
        />

        {loading ? (
          <Loader label="Loading statistics..." />
        ) : !stats ? (
          <EmptyState title="No data available" />
        ) : (
          <>
            <div className="stat-grid">
              <StatCard icon={Hourglass} label="Waiting now" value={stats.waitingNow} tone="indigo" />
              <StatCard icon={Users} label="Being served" value={stats.servingNow} tone="purple" />
              <StatCard icon={CheckCircle2} label="Completed today" value={stats.completedToday} tone="success" />
              <StatCard icon={Clock3} label="Avg. wait (min)" value={stats.avgWaitMinutes} tone="warning" />
              <StatCard icon={ListTodo} label="Tokens issued today" value={stats.todayTokens} tone="default" />
              <StatCard icon={Building2} label="Active services" value={stats.totalServices} tone="default" />
            </div>

            <div className="table-card">
              <div className="table-card-header">
                <h3>Per-service breakdown</h3>
                <p>Current waiting count and today's completions for each service.</p>
              </div>
              {stats.perService.length === 0 ? (
                <EmptyState title="No services yet" description="Create a service to see it here." />
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Waiting now</th>
                      <th>Completed today</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.perService.map((s) => (
                      <tr key={s.serviceId}>
                        <td>{s.name}</td>
                        <td>{s.waiting}</td>
                        <td>{s.completedToday}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
