import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

const jobs = [
  { 
    id: '1', 
    title: 'Metro Line 3 Foundation', 
    client: 'MMRDA', 
    location: 'Bandra, Mumbai', 
    status: 'active', 
    budget: 1250000, 
    spent: 450000, 
    progress: 35,
    startDate: '2024-01-15'
  },
  { 
    id: '2', 
    title: 'Phoenix Mall Renovation', 
    client: 'Phoenix Mills', 
    location: 'Kurla, Mumbai', 
    status: 'active', 
    budget: 850000, 
    spent: 620000, 
    progress: 75,
    startDate: '2023-11-20'
  },
  { 
    id: '3', 
    title: 'Residential Complex B', 
    client: 'Lodha Group', 
    location: 'Thane', 
    status: 'pending', 
    budget: 2500000, 
    spent: 0, 
    progress: 0,
    startDate: '2024-04-01'
  },
  { 
    id: '4', 
    title: 'Highway Expansion P-2', 
    client: 'NHAI', 
    location: 'Nashik Highway', 
    status: 'completed', 
    budget: 4500000, 
    spent: 4450000, 
    progress: 100,
    startDate: '2023-06-10'
  },
];

export default function Jobs() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{t('projects')}</h2>
          <p className="text-on-surface-variant text-base md:text-lg">{t('manage_preferences')}</p>
        </div>
        <Link to="/jobs/create" className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 justify-center">
          <Plus className="w-5 h-5" />
          {t('create_new')}
        </Link>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: t('active_projects'), value: '02', icon: TrendingUp, color: 'text-primary' },
          { label: t('pending_payouts'), value: '01', icon: Clock, color: 'text-secondary-container' },
          { label: t('completed_projects'), value: '04', icon: CheckCircle2, color: 'text-tertiary' },
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
        <div className="flex bg-surface-container p-1 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="flex min-w-max">
            {['all', 'active', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                  filter === f ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all">
            <Filter className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </section>

      {/* Jobs List */}
      <section className="grid grid-cols-1 gap-4">
        {filteredJobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="organic-card group cursor-pointer hover:bg-surface-container-high/50"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    job.status === 'active' ? "bg-green-100 text-green-700" :
                    job.status === 'pending' ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {job.status}
                  </span>
                  <h4 className="text-xl font-bold text-on-surface">{job.title}</h4>
                </div>
                
                <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.client}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Started {job.startDate}</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-64 space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant font-medium">Budget Utilization</span>
                  <span className="font-bold">{job.progress}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${job.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      job.progress > 90 ? "bg-red-500" : "bg-primary"
                    )}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface-variant">₹{(job.spent / 100000).toFixed(1)}L Spent</span>
                  <span className="text-on-surface-variant">₹{(job.budget / 100000).toFixed(1)}L Total</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link 
                  to={`/jobs/${job.id}`}
                  className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <button className="p-3 hover:bg-surface-container-highest rounded-2xl transition-all">
                  <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
