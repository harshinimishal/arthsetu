import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Users, 
  UserCheck, 
  UserMinus,
  Calendar,
  ChevronRight,
  Phone,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

const workers = [
  { id: '1', name: 'Amit Sharma', role: 'Mason', dailyWage: 850, status: 'active', attendance: 95, phone: '+91 98765 43210' },
  { id: '2', name: 'Suresh Kumar', role: 'Electrician', dailyWage: 950, status: 'active', attendance: 88, phone: '+91 98765 43211' },
  { id: '3', name: 'Rahul Verma', role: 'Plumber', dailyWage: 900, status: 'on-leave', attendance: 75, phone: '+91 98765 43212' },
  { id: '4', name: 'Vikram Singh', role: 'Helper', dailyWage: 550, status: 'active', attendance: 92, phone: '+91 98765 43213' },
  { id: '5', name: 'Deepak Jha', role: 'Carpenter', dailyWage: 950, status: 'inactive', attendance: 60, phone: '+91 98765 43214' },
];

export default function Labor() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{t('team')}</h2>
          <p className="text-on-surface-variant text-base md:text-lg">{t('manage_preferences')}</p>
        </div>
        <Link to="/labor/register" className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 justify-center">
          <Plus className="w-5 h-5" />
          {t('register_new')}
        </Link>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: t('total_team'), value: '156', icon: Users, color: 'text-primary' },
          { label: t('active_projects'), value: '142', icon: UserCheck, color: 'text-tertiary' },
          { label: t('pending_payouts'), value: '14', icon: UserMinus, color: 'text-secondary-container' },
        ].map((card, i) => (
          <div key={i} className="organic-card flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-surface-container-highest">
              <card.icon className={cn("w-8 h-8", card.color)} />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">{card.label}</p>
              <h3 className="text-3xl font-bold">{card.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Filters & Search */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search by name or role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Link to="/labor/attendance" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold">
            <Calendar className="w-4 h-4" />
            Attendance Log
          </Link>
          <button className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all">
            <Filter className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </section>

      {/* Worker Table */}
      <section className="organic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Worker Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Daily Wage</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Attendance</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {filteredWorkers.map((worker, i) => (
                <motion.tr 
                  key={worker.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-container-high/30 transition-all group"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{worker.name}</p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {worker.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-sm font-medium text-on-surface-variant">{worker.role}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-sm font-bold text-on-surface">₹{worker.dailyWage}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      worker.status === 'active' ? "bg-green-100 text-green-700" :
                      worker.status === 'on-leave' ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden w-24">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            worker.attendance > 90 ? "bg-green-500" : 
                            worker.attendance > 70 ? "bg-primary" : "bg-red-500"
                          )}
                          style={{ width: `${worker.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{worker.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/labor/${worker.id}`} className="p-2 hover:bg-surface-container-highest rounded-lg transition-all">
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      </Link>
                      <button className="p-2 hover:bg-surface-container-highest rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Wage Payments */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="organic-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Wage Payments</h3>
            <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              View History <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Amit Sharma', amount: 5950, date: '24 Mar 2024', status: 'success' },
              { name: 'Vikram Singh', amount: 3850, date: '24 Mar 2024', status: 'success' },
              { name: 'Suresh Kumar', amount: 6650, date: '23 Mar 2024', status: 'pending' },
            ].map((payment, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{payment.name}</p>
                    <p className="text-xs text-on-surface-variant">{payment.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-on-surface">₹{payment.amount}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase",
                    payment.status === 'success' ? "text-green-600" : "text-orange-600"
                  )}>{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="organic-card bg-primary text-white">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Payout Summary</h3>
              <Users className="w-6 h-6 opacity-50" />
            </div>
            
            <div className="space-y-2">
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Total Payouts This Week</p>
              <h4 className="text-5xl font-bold">₹1,42,500</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-white/60 text-xs font-medium">Paid Workers</p>
                <p className="text-xl font-bold">128</p>
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">Pending Payouts</p>
                <p className="text-xl font-bold">28</p>
              </div>
            </div>

            <button className="w-full py-4 bg-white text-primary rounded-2xl font-bold hover:bg-secondary-container hover:text-on-surface transition-all">
              Process All Pending Payouts
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
