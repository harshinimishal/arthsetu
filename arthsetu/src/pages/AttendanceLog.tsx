import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Save,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export default function AttendanceLog() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([
    { id: '1', name: 'Amit Sharma', role: 'Mason', status: 'present' },
    { id: '2', name: 'Suresh Kumar', role: 'Electrician', status: 'present' },
    { id: '3', name: 'Rahul Verma', role: 'Plumber', status: 'absent' },
    { id: '4', name: 'Vikram Singh', role: 'Helper', status: 'present' },
    { id: '5', name: 'Deepak Jha', role: 'Carpenter', status: 'present' },
    { id: '6', name: 'Manoj Tiwari', role: 'Mason', status: 'half-day' },
    { id: '7', name: 'Sanjay Dutt', role: 'Helper', status: 'present' },
    { id: '8', name: 'Arjun Kapoor', role: 'Mason', status: 'absent' },
  ]);

  const toggleStatus = (id: string, status: string) => {
    setAttendance(attendance.map(w => w.id === id ? { ...w, status } : w));
  };

  const presentCount = attendance.filter(w => w.status === 'present').length;
  const halfDayCount = attendance.filter(w => w.status === 'half-day').length;
  const absentCount = attendance.filter(w => w.status === 'absent').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/labor" className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all shrink-0">
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">{t('team')}</h2>
            <p className="text-on-surface-variant text-xs md:text-sm font-medium">{t('manage_preferences')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold flex-1 md:flex-none justify-center">
            {t('reports')}
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 flex-1 md:flex-none justify-center">
            <Save className="w-5 h-5" />
            {t('save_changes')}
          </button>
        </div>
      </section>

      {/* Date Selector & Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="organic-card flex items-center justify-between lg:col-span-1">
          <button className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
          </button>
          <div className="text-center">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Selected Date</p>
            <p className="text-lg font-bold text-primary">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Present', value: presentCount, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Half Day', value: halfDayCount, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Absent', value: absentCount, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat) => (
            <div key={stat.label} className={cn("organic-card flex items-center gap-4", stat.bg)}>
              <div className={cn("p-3 rounded-xl bg-white", stat.color)}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{stat.label}</p>
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search & Filters */}
      <section className="flex flex-col md:row gap-4 items-center justify-between">
        <div className="relative flex-1 md:max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search workers..." 
            className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-2xl border-none text-sm outline-none"
            />
          </div>
          <button className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all">
            <Filter className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </section>

      {/* Attendance Table */}
      <section className="organic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Worker</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {attendance.map((worker, i) => (
                <motion.tr 
                  key={worker.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-container-high/30 transition-all"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <p className="font-bold text-on-surface">{worker.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-on-surface-variant">{worker.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {[
                        { id: 'present', label: 'Present', icon: Check, color: 'bg-green-100 text-green-700', active: 'bg-green-600 text-white' },
                        { id: 'half-day', label: 'Half Day', icon: Clock, color: 'bg-orange-100 text-orange-700', active: 'bg-orange-600 text-white' },
                        { id: 'absent', label: 'Absent', icon: X, color: 'bg-red-100 text-red-700', active: 'bg-red-600 text-white' },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => toggleStatus(worker.id, btn.id)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            worker.status === btn.id ? btn.active : btn.color + " opacity-40 hover:opacity-100"
                          )}
                        >
                          <btn.icon className="w-4 h-4" />
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
