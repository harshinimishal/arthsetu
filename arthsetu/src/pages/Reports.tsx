import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createDocument, subscribeToDocuments } from '../services/firestoreService';
import { where } from 'firebase/firestore';

interface ExportRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  status: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [type, setType] = useState('financial');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [exports, setExports] = useState<ExportRecord[]>([]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    return subscribeToDocuments<ExportRecord>('report_exports', [where('ownerUid', '==', user.uid)], setExports);
  }, [user?.uid]);

  const filtered = useMemo(() => exports.filter((x) => x.name.toLowerCase().includes(query.toLowerCase())), [exports, query]);

  const generate = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await createDocument('report_exports', {
        type,
        name: `${type.toUpperCase()}_${stamp}.pdf`,
        date: stamp,
        size: '1.2 MB',
        status: 'completed',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-3xl font-bold">Reports</h2>
        <button onClick={generate} disabled={saving} className="btn-primary px-5 py-3 rounded-xl">{saving ? 'Generating...' : 'Generate'}</button>
      </div>

      <div className="organic-card grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="p-3 rounded-xl bg-surface-container-high">
          <option value="financial">Financial</option>
          <option value="labor">Labor</option>
          <option value="job">Job/Service</option>
          <option value="tax">Tax</option>
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exports" className="p-3 rounded-xl bg-surface-container-high md:col-span-2" />
      </div>

      <div className="organic-card space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className="p-3 rounded-xl bg-surface-container-high flex justify-between">
            <span>{r.name} ({r.type})</span>
            <span>{r.date} • {r.status}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-on-surface-variant">No report exports yet.</p>}
      </div>
    </div>
  );
}
