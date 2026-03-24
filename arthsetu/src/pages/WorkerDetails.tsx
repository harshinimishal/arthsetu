import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDocument, subscribeToDocuments } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';
import { where } from 'firebase/firestore';

interface Worker {
  id: string;
  name: string;
  role: string;
  status?: string;
  dailyWage?: number;
  phone?: string;
  address?: string;
  attendance?: number;
}

interface Txn {
  id: string;
  amount: number;
  status?: string;
  date?: string;
  recipient?: string;
  workerId?: string;
  type?: string;
}

export default function WorkerDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [payouts, setPayouts] = useState<Txn[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id || !user?.uid) return;
      const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
      const { team } = resolveBusinessCollections(businessType);
      const member = await getDocument<Worker>(team, id);
      if (member) setWorker(member);
    };
    load();
  }, [id, profile?.businessType, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !id) return undefined;
    return subscribeToDocuments<Txn>('transactions', [where('ownerUid', '==', user.uid)], (data) => {
      setPayouts(data.filter((x) => x.type === 'debit' && (x.workerId === id || x.recipient === worker?.name)));
    });
  }, [id, user?.uid, worker?.name]);

  const totalEarned = useMemo(() => payouts.filter((x) => x.status === 'completed').reduce((s, x) => s + Number(x.amount || 0), 0), [payouts]);

  if (!worker) return <div className="organic-card">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/labor" className="text-primary">Back</Link>
        <h2 className="text-3xl font-bold">{worker.name}</h2>
        <p className="text-on-surface-variant">{worker.role} • {worker.phone || '-'} • {worker.status || 'active'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="organic-card">Daily Wage: INR {Number(worker.dailyWage || 0).toLocaleString('en-IN')}</div>
        <div className="organic-card">Total Earned: INR {totalEarned.toLocaleString('en-IN')}</div>
        <div className="organic-card">Attendance: {Math.round(Number(worker.attendance || 0))}%</div>
        <div className="organic-card">Address: {worker.address || '-'}</div>
      </div>

      <div className="organic-card">
        <h3 className="font-bold mb-2">Payout History</h3>
        <div className="space-y-2">
          {payouts.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-surface-container-high flex justify-between">
              <span>{p.date || '-'} • {p.status || 'pending'}</span>
              <span>INR {Number(p.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          ))}
          {payouts.length === 0 && <p className="text-sm text-on-surface-variant">No payouts yet.</p>}
        </div>
      </div>
    </div>
  );
}
