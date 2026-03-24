import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDocument, subscribeToDocuments } from '../services/firestoreService';
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

interface Txn {
  id: string;
  description?: string;
  amount: number;
  type: string;
  category?: string;
  date?: string;
  jobId?: string;
  job?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status?: string;
  jobId?: string;
}

export default function JobDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [work, setWork] = useState<WorkItem | null>(null);
  const [tx, setTx] = useState<Txn[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id || !user?.uid) return;
      const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
      const { work } = resolveBusinessCollections(businessType);
      const item = await getDocument<WorkItem>(work, id);
      if (item) setWork(item);
    };
    load();
  }, [id, profile?.businessType, user?.uid]);

  useEffect(() => {
    if (!id || !user?.uid) return undefined;
    const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
    const collections = resolveBusinessCollections(businessType);

    const un1 = subscribeToDocuments<Txn>('transactions', [where('ownerUid', '==', user.uid)], (data) => {
      setTx(data.filter((x) => x.jobId === id || x.job === work?.title));
    });

    const un2 = subscribeToDocuments<TeamMember>(collections.team, [where('ownerUid', '==', user.uid)], (data) => {
      setTeam(data.filter((m) => !m.jobId || m.jobId === id));
    });

    return () => {
      un1();
      un2();
    };
  }, [id, profile?.businessType, user?.uid, work?.title]);

  const progress = useMemo(() => {
    if (!work?.budget) return 0;
    return Math.round((Number(work.spent || 0) / Number(work.budget || 0)) * 100);
  }, [work?.budget, work?.spent]);

  if (!work) return <div className="organic-card">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/jobs" className="text-primary">Back</Link>
          <h2 className="text-3xl font-bold">{work.title}</h2>
          <p className="text-on-surface-variant">{work.client} • {work.location} • {work.status}</p>
        </div>
        <Link to="/transactions" className="btn-primary px-4 py-3 rounded-xl">Add Transaction</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="organic-card">Budget: INR {Number(work.budget || 0).toLocaleString('en-IN')}</div>
        <div className="organic-card">Spent: INR {Number(work.spent || 0).toLocaleString('en-IN')}</div>
        <div className="organic-card">Progress: {progress}%</div>
        <div className="organic-card">Team: {team.length}</div>
      </div>

      <div className="organic-card">
        <h3 className="font-bold mb-2">Transactions</h3>
        <div className="space-y-2">
          {tx.map((t) => (
            <div key={t.id} className="p-3 rounded-xl bg-surface-container-high flex justify-between">
              <span>{t.description || t.category || 'Transaction'} ({t.date || '-'})</span>
              <span>{t.type === 'credit' ? '+' : '-'} INR {Number(t.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          ))}
          {tx.length === 0 && <p className="text-sm text-on-surface-variant">No transactions yet.</p>}
        </div>
      </div>
    </div>
  );
}
