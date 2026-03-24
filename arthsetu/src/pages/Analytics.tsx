import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToDocuments } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';
import { where } from 'firebase/firestore';

interface Txn { id: string; type: string; amount: number; date?: string; }
interface WorkItem { id: string; status?: string; budget?: number; spent?: number; location?: string; title?: string; }
interface TeamMember { id: string; status?: string; }

export default function Analytics() {
  const { user, profile } = useAuth();
  const [tx, setTx] = useState<Txn[]>([]);
  const [work, setWork] = useState<WorkItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
    const collections = resolveBusinessCollections(businessType);

    const un1 = subscribeToDocuments<Txn>('transactions', [where('ownerUid', '==', user.uid)], setTx);
    const un2 = subscribeToDocuments<WorkItem>(collections.work, [where('ownerUid', '==', user.uid)], setWork);
    const un3 = subscribeToDocuments<TeamMember>(collections.team, [where('ownerUid', '==', user.uid)], setTeam);
    return () => { un1(); un2(); un3(); };
  }, [profile?.businessType, user?.uid]);

  const revenue = useMemo(() => tx.filter((x) => x.type === 'credit').reduce((s, x) => s + Number(x.amount || 0), 0), [tx]);
  const expense = useMemo(() => tx.filter((x) => x.type === 'debit').reduce((s, x) => s + Number(x.amount || 0), 0), [tx]);
  const margin = revenue > 0 ? Math.round(((revenue - expense) / revenue) * 100) : 0;
  const activeWork = work.filter((x) => x.status === 'active').length;
  const activeTeam = team.filter((x) => x.status === 'active').length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="organic-card">Revenue: INR {revenue.toLocaleString('en-IN')}</div>
        <div className="organic-card">Expense: INR {expense.toLocaleString('en-IN')}</div>
        <div className="organic-card">Net margin: {margin}%</div>
        <div className="organic-card">Active work: {activeWork} | Active team: {activeTeam}</div>
      </div>

      <div className="organic-card">
        <h3 className="font-bold mb-2">Top Work Profitability</h3>
        <div className="space-y-2">
          {work.slice(0, 5).map((w) => {
            const budget = Number(w.budget || 0);
            const spent = Number(w.spent || 0);
            const pct = budget > 0 ? Math.round(((budget - spent) / budget) * 100) : 0;
            return <div key={w.id} className="p-3 rounded-xl bg-surface-container-high">{w.title || 'Work item'}: {pct}%</div>;
          })}
        </div>
      </div>
    </div>
  );
}
