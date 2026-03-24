import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { createDocument, removeDocument, subscribeToDocuments, updateDocument } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';

interface WorkItem {
  id: string;
  title: string;
  client?: string;
  location?: string;
  status?: 'planned' | 'active' | 'pending' | 'completed';
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  model?: 'service' | 'contract';
  category?: string;
  durationMinutes?: number;
}

interface WorkForm {
  title: string;
  client: string;
  location: string;
  status: 'planned' | 'active' | 'pending' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  category: string;
  durationMinutes: number;
}

const initialForm: WorkForm = {
  title: '',
  client: '',
  location: '',
  status: 'planned',
  startDate: '',
  endDate: '',
  budget: 0,
  category: 'General',
  durationMinutes: 60,
};

export default function Jobs() {
  const { user, profile } = useAuth();
  const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
  const isService = businessType === 'service';
  const { work } = resolveBusinessCollections(businessType);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<WorkItem[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.uid) return undefined;

    return subscribeToDocuments<WorkItem>(work, [where('ownerUid', '==', user.uid)], (data) => setItems(data));
  }, [user?.uid, work]);

  const filtered = useMemo(() => {
    return items.filter((x) => {
      const statusOk = filter === 'all' || x.status === filter;
      const searchOk = `${x.title || ''} ${x.client || ''} ${x.location || ''}`.toLowerCase().includes(search.toLowerCase());
      return statusOk && searchOk;
    });
  }, [filter, items, search]);

  const startCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setError('');
    setShowForm(true);
  };

  const startEdit = (item: WorkItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      client: item.client || '',
      location: item.location || '',
      status: item.status || 'planned',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      budget: Number(item.budget || 0),
      category: item.category || 'General',
      durationMinutes: Number(item.durationMinutes || 60),
    });
    setError('');
    setShowForm(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError(isService ? 'Service name is required.' : 'Project title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        client: form.client.trim() || null,
        location: form.location.trim() || null,
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        budget: Number(form.budget || 0),
        spent: 0,
        model: isService ? 'service' : 'contract',
        category: isService ? form.category : null,
        durationMinutes: isService ? Number(form.durationMinutes || 0) : null,
      };

      if (editingId) {
        await updateDocument(work, editingId, payload);
      } else {
        await createDocument(work, payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
    } catch (submitError) {
      console.error(submitError);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: string) => {
    const ok = window.confirm('Delete this item? This will not auto-delete linked tasks/materials/expenses.');
    if (!ok) return;

    try {
      await removeDocument(work, id);
    } catch (deleteError) {
      console.error(deleteError);
      setError('Failed to delete item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-3xl font-bold">{isService ? 'Services' : 'Projects'}</h2>
        <button type="button" onClick={startCreate} className="btn-primary px-5 py-3 rounded-xl">
          {isService ? 'Add Service' : 'Add Project'}
        </button>
      </div>

      <div className="organic-card flex flex-col md:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isService ? 'Search services' : 'Search projects'}
          className="p-3 rounded-xl bg-surface-container-high flex-1"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-3 rounded-xl bg-surface-container-high w-full md:w-44">
          <option value="all">All</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={submit} className="organic-card space-y-4">
          <h3 className="text-xl font-bold">{editingId ? 'Edit' : 'Create'} {isService ? 'Service' : 'Project'}</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={isService ? 'Service Name' : 'Project Title'}
              className="p-3 rounded-xl bg-surface-container-high"
              required
            />
            <input
              value={form.client}
              onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}
              placeholder={isService ? 'Primary Client (optional)' : 'Client Name'}
              className="p-3 rounded-xl bg-surface-container-high"
            />
            <input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Location"
              className="p-3 rounded-xl bg-surface-container-high"
            />
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as WorkForm['status'] }))}
              className="p-3 rounded-xl bg-surface-container-high"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              className="p-3 rounded-xl bg-surface-container-high"
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              className="p-3 rounded-xl bg-surface-container-high"
            />

            <input
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => setForm((p) => ({ ...p, budget: Number(e.target.value || 0) }))}
              placeholder="Budget"
              className="p-3 rounded-xl bg-surface-container-high"
            />

            {isService ? (
              <>
                <input
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Service Category"
                  className="p-3 rounded-xl bg-surface-container-high"
                />
                <input
                  type="number"
                  min={0}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value || 0) }))}
                  placeholder="Duration (minutes)"
                  className="p-3 rounded-xl bg-surface-container-high"
                />
              </>
            ) : null}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-5 py-3 rounded-xl">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(initialForm);
              }}
              className="px-5 py-3 rounded-xl bg-surface-container"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((item) => {
          const progress = item.budget && item.budget > 0 ? Math.round((Number(item.spent || 0) / Number(item.budget || 0)) * 100) : 0;
          return (
            <div key={item.id} className="organic-card flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <p className="font-bold text-lg">{item.title || 'Untitled'}</p>
                <p className="text-sm text-on-surface-variant">{item.client || 'Client'} � {item.location || 'Location'}</p>
                <p className="text-sm text-on-surface-variant">
                  Status: {item.status || 'planned'} | Budget: INR {Number(item.budget || 0).toLocaleString('en-IN')} | Progress: {progress}%
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(item)} className="px-4 py-2 rounded-lg bg-surface-container-high">Edit</button>
                <button type="button" onClick={() => removeItem(item.id)} className="px-4 py-2 rounded-lg bg-red-100 text-red-700">Delete</button>
                <Link to={`/jobs/${item.id}`} className="px-4 py-2 rounded-lg bg-primary/10 text-primary">Details</Link>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="organic-card text-sm text-on-surface-variant">No items found.</div>}
      </div>
    </div>
  );
}
