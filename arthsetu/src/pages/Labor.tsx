import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToDocuments } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';
import { where } from 'firebase/firestore';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  dailyWage?: number;
  status?: string;
  attendance?: number;
}

export default function Labor() {
  const { user, profile } = useAuth();
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
    const { team } = resolveBusinessCollections(businessType);

    return subscribeToDocuments<TeamMember>(team, [where('ownerUid', '==', user.uid)], (data) => setTeam(data));
  }, [profile?.businessType, user?.uid]);

  const filtered = useMemo(
    () => team.filter((x) => `${x.name || ''} ${x.role || ''}`.toLowerCase().includes(search.toLowerCase())),
    [search, team],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-3xl font-bold">Team / Staff</h2>
        <Link to="/labor/register" className="btn-primary px-5 py-3 rounded-xl">Register New</Link>
      </div>

      <div className="organic-card flex flex-col md:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or role" className="p-3 rounded-xl bg-surface-container-high flex-1" />
        <Link to="/labor/attendance" className="px-4 py-3 rounded-xl bg-surface-container-high text-center">Attendance</Link>
      </div>

      <div className="organic-card overflow-auto">
        <table className="w-full text-left">
          <thead><tr><th className="py-2">Name</th><th>Role</th><th>Phone</th><th>Wage</th><th>Status</th><th>Attendance</th><th></th></tr></thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-outline/10">
                <td className="py-3">{m.name || 'Unnamed'}</td>
                <td>{m.role || '-'}</td>
                <td>{m.phone || '-'}</td>
                <td>{Number(m.dailyWage || 0).toLocaleString('en-IN')}</td>
                <td>{m.status || 'inactive'}</td>
                <td>{Math.round(Number(m.attendance || 0))}%</td>
                <td><Link to={`/labor/${m.id}`} className="text-primary">Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-on-surface-variant py-4">No team members found.</p>}
      </div>
    </div>
  );
}
