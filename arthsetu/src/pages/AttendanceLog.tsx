import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resolveBusinessCollections } from '../services/businessService';
import { getDocuments, createDocument, updateDocument } from '../services/firestoreService';
import { where } from 'firebase/firestore';

type AttendanceStatus = 'present' | 'half-day' | 'absent';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface AttendanceLogDoc {
  id: string;
  date: string;
  entries: Array<{ workerId: string; status: AttendanceStatus }>;
}

export default function AttendanceLog() {
  const { user, profile } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [docId, setDocId] = useState<string | null>(null);
  const [rows, setRows] = useState<Array<{ id: string; name: string; role: string; status: AttendanceStatus }>>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
      const { team } = resolveBusinessCollections(businessType);

      const members = await getDocuments<TeamMember>(team, [where('ownerUid', '==', user.uid)]);
      const logs = await getDocuments<AttendanceLogDoc>('attendance_logs', [where('ownerUid', '==', user.uid), where('date', '==', date)]);
      const existing = logs[0];
      setDocId(existing?.id || null);

      const statusMap = new Map((existing?.entries || []).map((e) => [e.workerId, e.status]));
      setRows(
        members.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          status: (statusMap.get(m.id) || 'present') as AttendanceStatus,
        })),
      );
    };
    load();
  }, [date, profile?.businessType, user?.uid]);

  const stats = useMemo(() => ({
    present: rows.filter((r) => r.status === 'present').length,
    halfDay: rows.filter((r) => r.status === 'half-day').length,
    absent: rows.filter((r) => r.status === 'absent').length,
  }), [rows]);

  const save = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setMessage('');
    const payload = { date, entries: rows.map((r) => ({ workerId: r.id, status: r.status })) };
    try {
      if (docId) {
        await updateDocument('attendance_logs', docId, payload);
      } else {
        const newId = await createDocument('attendance_logs', payload);
        if (newId) setDocId(newId);
      }
      setMessage('Attendance saved.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/labor" className="p-3 rounded-xl bg-surface-container"><ArrowLeft className="w-5 h-5" /></Link>
          <h2 className="text-2xl font-bold">Attendance Log</h2>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary px-5 py-3 rounded-xl"><Save className="w-4 h-4 inline mr-2" />{saving ? 'Saving...' : 'Save'}</button>
      </div>

      {message && <p className="text-sm text-on-surface-variant">{message}</p>}

      <div className="organic-card grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-3 rounded-xl bg-surface-container-high" />
        <div className="text-sm">Present: <strong>{stats.present}</strong></div>
        <div className="text-sm">Half-day: <strong>{stats.halfDay}</strong></div>
        <div className="text-sm">Absent: <strong>{stats.absent}</strong></div>
      </div>

      <div className="organic-card overflow-auto">
        <table className="w-full text-left">
          <thead><tr><th className="py-2">Worker</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-outline/10">
                <td className="py-3">{r.name}</td>
                <td>{r.role}</td>
                <td>
                  <select value={r.status} onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, status: e.target.value as AttendanceStatus } : x))} className="p-2 rounded-lg bg-surface-container-high">
                    <option value="present">Present</option>
                    <option value="half-day">Half Day</option>
                    <option value="absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
