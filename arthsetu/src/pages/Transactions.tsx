import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToDocuments } from '../services/firestoreService';
import { where } from 'firebase/firestore';

interface Txn {
  id: string;
  type: 'credit' | 'debit' | string;
  amount: number;
  category?: string;
  job?: string;
  recipient?: string;
  date?: string;
  status?: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState<Txn[]>([]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    return subscribeToDocuments<Txn>('transactions', [where('ownerUid', '==', user.uid)], (data) => setRows(data));
  }, [user?.uid]);

  const filtered = useMemo(() => {
    return rows.filter((x) => {
      const filterOk = filter === 'all' || x.type === filter;
      const searchOk = `${x.recipient || ''} ${x.job || ''} ${x.category || ''}`.toLowerCase().includes(search.toLowerCase());
      return filterOk && searchOk;
    });
  }, [filter, rows, search]);

  const totalRevenue = rows.filter((x) => x.type === 'credit').reduce((s, x) => s + Number(x.amount || 0), 0);
  const pendingPayout = rows.filter((x) => x.type === 'debit' && x.status === 'pending').reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Transactions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="organic-card">Revenue: <strong>INR {totalRevenue.toLocaleString('en-IN')}</strong></div>
        <div className="organic-card">Pending payouts: <strong>INR {pendingPayout.toLocaleString('en-IN')}</strong></div>
      </div>

      <div className="organic-card flex flex-col md:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="p-3 rounded-xl bg-surface-container-high flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-3 rounded-xl bg-surface-container-high w-full md:w-44">
          <option value="all">All</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
      </div>

      <div className="organic-card overflow-auto">
        <table className="w-full text-left">
          <thead><tr><th className="py-2">Recipient</th><th>Project/Service</th><th>Category</th><th>Date</th><th>Status</th><th className="text-right">Amount</th></tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-outline/10">
                <td className="py-3">{t.recipient || '-'}</td>
                <td>{t.job || '-'}</td>
                <td>{t.category || '-'}</td>
                <td>{t.date || '-'}</td>
                <td>{t.status || 'pending'}</td>
                <td className="text-right">{t.type === 'credit' ? '+' : '-'} INR {Number(t.amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
