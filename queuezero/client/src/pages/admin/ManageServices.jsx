import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Settings2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';
import { useNotify } from '../../context/NotificationContext';

const emptyForm = { name: '', description: '', department: '', avgServiceTimeMinutes: 5, isActive: true };

const ManageServices = () => {
  const notify = useNotify();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    loadServices();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description || '',
      department: service.department,
      avgServiceTimeMinutes: service.avgServiceTimeMinutes,
      isActive: service.isActive,
    });
    setEditingId(service._id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, form);
        notify('Service updated', 'success');
      } else {
        await api.post('/services', form);
        notify('Service created', 'success');
      }
      setShowForm(false);
      loadServices();
    } catch (err) {
      notify(err.response?.data?.message || 'Could not save service', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/services/${deleteTarget._id}`);
      notify('Service deleted', 'success');
      setDeleteTarget(null);
      loadServices();
    } catch (err) {
      notify(err.response?.data?.message || 'Could not delete service', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <PageHeader
          eyebrow="Configuration"
          title="Manage services"
          description="Add, edit, or retire the services customers can join a queue for."
          action={
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> New service
            </button>
          }
        />

        {loading ? (
          <Loader label="Loading services..." />
        ) : services.length === 0 ? (
          <EmptyState
            icon={Settings2}
            title="No services yet"
            description="Create your first service so customers can start joining queues."
            action={
              <button className="btn btn-primary" onClick={openCreate}>
                <Plus size={16} /> New service
              </button>
            }
          />
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Department</th>
                  <th>Avg. time</th>
                  <th>Status</th>
                  <th>Waiting</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <p className="table-primary-text">{s.name}</p>
                      {s.description && <p className="table-secondary-text">{s.description}</p>}
                    </td>
                    <td>{s.department}</td>
                    <td>{s.avgServiceTimeMinutes} min</td>
                    <td>
                      <span className={`badge ${s.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{s.waitingCount}</td>
                    <td className="table-actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(s)}>
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(s)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card-form">
            <button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">
              <X size={18} />
            </button>
            <h3>{editingId ? 'Edit service' : 'Create a new service'}</h3>
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="field">
                <span>Service name</span>
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label className="field">
                <span>Department / category</span>
                <input name="department" value={form.department} onChange={handleChange} required />
              </label>
              <label className="field">
                <span>Description (optional)</span>
                <textarea name="description" rows={2} value={form.description} onChange={handleChange} />
              </label>
              <label className="field">
                <span>Average service time (minutes)</span>
                <input
                  type="number"
                  min="1"
                  name="avgServiceTimeMinutes"
                  value={form.avgServiceTimeMinutes}
                  onChange={handleChange}
                  required
                />
              </label>
              {editingId && (
                <label className="checkbox-field">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                  <span>Service is active and visible to customers</span>
                </label>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this service?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This can't be undone.`
            : ''
        }
        confirmLabel="Delete service"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default ManageServices;
