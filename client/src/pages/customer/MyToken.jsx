import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketX, PlusCircle, RefreshCcw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import TokenTicket from '../../components/TokenTicket';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';
import { useNotify } from '../../context/NotificationContext';

const POLL_INTERVAL_MS = 6000;

const MyToken = () => {
  const notify = useNotify();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const fetchToken = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const { data } = await api.get('/queue/my-token');
      setToken(data);
    } catch (err) {
      if (!isBackground) notify(err.response?.data?.message || 'Could not load your token', 'error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchToken();
    const interval = setInterval(() => fetchToken(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchToken]);

  const handleCancel = async () => {
    if (!token) return;
    setCancelling(true);
    try {
      await api.put(`/queue/${token._id}/cancel`);
      notify('Token cancelled', 'success');
      setShowCancelDialog(false);
      fetchToken();
    } catch (err) {
      notify(err.response?.data?.message || 'Could not cancel token', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell page-shell-narrow">
        <PageHeader
          eyebrow="Live tracking"
          title="Your current token"
          description="This page updates automatically as the queue moves."
          action={
            <button className="btn btn-outline btn-sm" onClick={() => fetchToken()}>
              <RefreshCcw size={15} /> Refresh
            </button>
          }
        />

        {loading ? (
          <Loader label="Fetching your token..." />
        ) : !token ? (
          <EmptyState
            icon={TicketX}
            title="No active token"
            description="You haven't joined a queue yet. Pick a service to get started."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                <PlusCircle size={16} /> Browse services
              </button>
            }
          />
        ) : (
          <>
            <TokenTicket token={token} />
            {['waiting', 'serving'].includes(token.status) && (
              <div className="ticket-actions">
                <button className="btn btn-danger-outline" onClick={() => setShowCancelDialog(true)}>
                  Cancel this token
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        open={showCancelDialog}
        title="Cancel your token?"
        message="You'll lose your place in this queue and will need to join again if you change your mind."
        confirmLabel="Yes, cancel token"
        tone="danger"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
        loading={cancelling}
      />
    </>
  );
};

export default MyToken;
