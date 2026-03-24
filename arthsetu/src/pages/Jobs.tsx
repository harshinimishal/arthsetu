import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToDocuments } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';
import { where } from 'firebase/firestore';

interface WorkItem {
  id: string;
  title: string;
  client: string;
  location: string;
  status: string;
  budget: number;
  spent: number;
  startDate?: string;
}

export default function Jobs() {
  const { user, profile } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<WorkItem[]>([]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
    const { work } = resolveBusinessCollections(businessType);

    return subscribeToDocuments<WorkItem>(work, [where('ownerUid', '==', user.uid)], (data) => setItems(data));
  }, [profile?.businessType, user?.uid]);

  const filtered = useMemo(() => {
    return items.filter((x) => {
      const statusOk = filter === 'all' || x.status === filter;
      const searchOk = `${x.title || ''} ${x.client || ''} ${x.location || ''}`.toLowerCase().includes(search.toLowerCase());
      return statusOk && searchOk;
    });
  }, [filter, items, search]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-3xl font-bold">Projects / Services</h2>
        <Link to="/jobs/create" className="btn-primary px-5 py-3 rounded-xl">Create New</Link>
      </div>

      <div className="organic-card flex flex-col md:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="p-3 rounded-xl bg-surface-container-high flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-3 rounded-xl bg-surface-container-high w-full md:w-44">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((item) => {
          const progress = item.budget > 0 ? Math.round((Number(item.spent || 0) / Number(item.budget || 0)) * 100) : 0;
          return (
            <div key={item.id} className="organic-card flex justify-between items-center gap-3">
              <div>
                <p className="font-bold text-lg">{item.title || 'Untitled'}</p>
                <p className="text-sm text-on-surface-variant">{item.client || 'Client'} • {item.location || 'Location'}</p>
                <p className="text-sm text-on-surface-variant">Status: {item.status || 'pending'} | Progress: {progress}%</p>
              </div>
              <Link to={`/jobs/${item.id}`} className="px-4 py-2 rounded-lg bg-primary/10 text-primary">Details</Link>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="organic-card text-sm text-on-surface-variant">No work items found.</div>}
      </div>
    </div>
  );
}
