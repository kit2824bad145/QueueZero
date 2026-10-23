import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import ServiceCard from '../../components/ServiceCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';
import { useNotify } from '../../context/NotificationContext';

const CustomerDashboard = () => {
  const notify = useNotify();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pendingService, setPendingService] = useState(null);
  const [joining, setJoining] = useState(false);
  const [hasActiveToken, setHasActiveToken] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch (err) {
      notify(err.response?.data?.message || 'Could not load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkActiveToken = async () => {
    try {
      const { data } = await api.get('/queue/my-token');
      setHasActiveToken(!!data);
    } catch {
      setHasActiveToken(false);
    }
  };

  useEffect(() => {
    loadServices();
    checkActiveToken();
  }, []);

  const confirmJoin = async () => {
    if (!pendingService) return;
    setJoining(true);
    try {
      await api.post('/queue/join', { serviceId: pendingService._id });
      notify(`Token issued for ${pendingService.name}`, 'success');
      setPendingService(null);
      navigate('/my-token');
    } catch (err) {
      notify(err.response?.data?.message || 'Could not join queue', 'error');
    } finally {
      setJoining(false);
    }
  };

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <PageHeader
          eyebrow="Available services"
          title="Choose a service to join"
          description="Pick where you need help — you'll get a live token and wait estimate instantly."
          action={
            <div className="search-box">
              <Search size={16} />
              <input
                placeholder="Search services or departments"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
        />

        {hasActiveToken && (
          <div className="alert alert-info">
            You already have an active token.{' '}
            <button className="link-btn" onClick={() => navigate('/my-token')}>
              View it here
            </button>
            .
          </div>
        )}

        {loading ? (
          <Loader label="Loading services..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No services found"
            description="Try a different search term, or check back later."
          />
        ) : (
          <div className="service-grid">
            {filtered.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                joining={joining && pendingService?._id === service._id}
                onJoin={setPendingService}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!pendingService}
        title="Join this queue?"
        message={
          pendingService
            ? `You're about to join the queue for "${pendingService.name}". You'll receive a token number instantly.`
            : ''
        }
        confirmLabel="Join queue"
        onConfirm={confirmJoin}
        onCancel={() => setPendingService(null)}
        loading={joining}
      />
    </>
  );
};

export default CustomerDashboard;
