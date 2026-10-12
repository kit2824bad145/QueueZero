import { useEffect, useState, useCallback } from 'react';
import { PhoneCall, CheckCircle2, SkipForward, XCircle, Users2, RefreshCcw } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';
import { useNotify } from '../../context/NotificationContext';

const POLL_INTERVAL_MS = 6000;

const QueueMonitor = () => {
  const notify = useNotify();

  const [services, setServices] = useState([]);
  const [activeServiceId, setActiveServiceId] = useState('');
  const [waiting, setWaiting] = useState([]);
  const [serving, setServing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, token }

  const loadServices = useCallback(async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data);
      if (data.length > 0 && !activeServiceId) setActiveServiceId(data[0]._id);
    } catch (err) {
      notify(err.response?.data?.message || 'Could not load services', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQueueData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const [waitingRes, servingRes] = await Promise.all([
          api.get('/admin/queue', { params: activeServiceId ? { serviceId: activeServiceId } : {} }),
          api.get('/admin/serving'),
        ]);
        setWaiting(waitingRes.data);
        setServing(servingRes.data);
      } catch (err) {
        if (!isBackground) notify(err.response?.data?.message || 'Could not load queue data', 'error');
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [activeServiceId, notify]
  );

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    loadQueueData();
    const interval = setInterval(() => loadQueueData(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadQueueData]);

  const activeService = services.find((s) => s._id === activeServiceId);
  const isServiceBeingServed = serving.some((t) => t.service?._id === activeServiceId);

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/admin/queue/${activeServiceId}/call-next`);
      notify(`Called token #${String(data.tokenNumber).padStart(3, '0')}`, 'success');
      loadQueueData();
    } catch (err) {
      notify(err.response?.data?.message || 'Could not call next token', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const runTokenAction = async (type, tokenId) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/queue/${tokenId}/${type}`);
      notify(
        type === 'complete' ? 'Token marked as completed' : type === 'skip' ? 'Token skipped' : 'Token cancelled',
        'success'
      );
      setConfirmAction(null);
      loadQueueData();
    } catch (err) {
      notify(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <PageHeader
          eyebrow="Live queues"
          title="Monitor & control queues"
          description="Call the next customer, mark tokens complete, or skip a no-show — updates every few seconds."
          action={
            <button className="btn btn-outline btn-sm" onClick={() => loadQueueData()}>
              <RefreshCcw size={15} /> Refresh
            </button>
          }
        />

        <div className="service-tabs">
          {services.map((s) => (
            <button
              key={s._id}
              className={`service-tab ${activeServiceId === s._id ? 'active' : ''}`}
              onClick={() => setActiveServiceId(s._id)}
            >
              {s.name}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader label="Loading queue..." />
        ) : (
          <div className="queue-control-grid">
            <div className="queue-panel">
              <div className="queue-panel-header">
                <h3>Now serving — {activeService?.name || 'Select a service'}</h3>
              </div>

              {serving.find((t) => t.service?._id === activeServiceId) ? (
                (() => {
                  const current = serving.find((t) => t.service?._id === activeServiceId);
                  return (
                    <div className="serving-card">
                      <div>
                        <p className="serving-token">#{String(current.tokenNumber).padStart(3, '0')}</p>
                        <p className="serving-customer">{current.customer?.name}</p>
                      </div>
                      <div className="serving-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => setConfirmAction({ type: 'complete', token: current })}
                          disabled={actionLoading}
                        >
                          <CheckCircle2 size={16} /> Complete
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => setConfirmAction({ type: 'skip', token: current })}
                          disabled={actionLoading}
                        >
                          <SkipForward size={16} /> Skip
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <EmptyState
                  icon={Users2}
                  title="No one being served"
                  description="Call the next token to begin serving this queue."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={handleCallNext}
                      disabled={actionLoading || !activeServiceId || waiting.length === 0}
                    >
                      <PhoneCall size={16} /> Call next token
                    </button>
                  }
                />
              )}
            </div>

            <div className="queue-panel">
              <div className="queue-panel-header">
                <h3>Waiting list</h3>
                <span className="badge badge-neutral">{waiting.length} waiting</span>
              </div>

              {waiting.length === 0 ? (
                <EmptyState title="Queue is empty" description="No customers are currently waiting." />
              ) : (
                <ul className="waiting-list">
                  {waiting.map((t, idx) => (
                    <li key={t._id} className="waiting-item">
                      <div>
                        <span className="waiting-position">{idx + 1}</span>
                        <div>
                          <p className="waiting-token">#{String(t.tokenNumber).padStart(3, '0')}</p>
                          <p className="waiting-customer">{t.customer?.name}</p>
                        </div>
                      </div>
                      <button
                        className="icon-btn icon-btn-danger"
                        title="Cancel this token"
                        onClick={() => setConfirmAction({ type: 'cancel', token: t })}
                        disabled={actionLoading}
                      >
                        <XCircle size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === 'complete'
            ? 'Mark token as completed?'
            : confirmAction?.type === 'skip'
            ? 'Skip this token?'
            : 'Cancel this token?'
        }
        message={
          confirmAction
            ? `Token #${String(confirmAction.token.tokenNumber).padStart(3, '0')} for ${confirmAction.token.customer?.name}.`
            : ''
        }
        confirmLabel={
          confirmAction?.type === 'complete' ? 'Mark complete' : confirmAction?.type === 'skip' ? 'Skip token' : 'Cancel token'
        }
        tone={confirmAction?.type === 'complete' ? 'default' : 'danger'}
        onConfirm={() => runTokenAction(confirmAction.type, confirmAction.token._id)}
        onCancel={() => setConfirmAction(null)}
        loading={actionLoading}
      />
    </div>
  );
};

export default QueueMonitor;
