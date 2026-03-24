import {
  Plus,
  TrendingUp,
  Users,
  Briefcase,
  CalendarClock,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  Settings,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardData, subscribeDashboardData } from '../services/dashboardService';

const EMPTY_DASHBOARD: DashboardData = {
  summary: {
    totalRevenue: 0,
    pendingPayouts: 0,
    activeWorkItems: 0,
    teamSize: 0,
    completionRate: 0,
  },
  trends: [
    { name: 'Mon', income: 0, expense: 0 },
    { name: 'Tue', income: 0, expense: 0 },
    { name: 'Wed', income: 0, expense: 0 },
    { name: 'Thu', income: 0, expense: 0 },
    { name: 'Fri', income: 0, expense: 0 },
    { name: 'Sat', income: 0, expense: 0 },
    { name: 'Sun', income: 0, expense: 0 },
  ],
  profitability: [],
  activities: [],
};

function formatCompactRupee(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD);

  const businessType = profile?.businessType === 'service' ? 'service' : 'contract';
  const isServiceBusiness = businessType === 'service';

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeDashboardData({
      userId: user.uid,
      businessType,
      onData: setDashboardData,
    });

    return unsubscribe;
  }, [user, businessType]);

  const summaryCards = [
    {
      label: t('total_revenue'),
      value: formatCompactRupee(dashboardData.summary.totalRevenue),
      change: '+0%',
      icon: TrendingUp,
      positive: true,
    },
    {
      label: isServiceBusiness ? 'Active Services' : t('active_projects'),
      value: dashboardData.summary.activeWorkItems.toString().padStart(2, '0'),
      change: 'Live',
      icon: isServiceBusiness ? CalendarClock : Briefcase,
      positive: true,
    },
    {
      label: isServiceBusiness ? 'Active Staff' : t('total_team'),
      value: dashboardData.summary.teamSize.toString(),
      change: 'Ready',
      icon: isServiceBusiness ? UserCheck : Users,
      positive: true,
    },
    {
      label: isServiceBusiness ? 'Completion Rate' : t('pending_payouts'),
      value: isServiceBusiness
        ? `${dashboardData.summary.completionRate}%`
        : `₹${dashboardData.summary.pendingPayouts.toLocaleString('en-IN')}`,
      change: isServiceBusiness ? 'This week' : 'Pending',
      icon: Clock,
      positive: isServiceBusiness ? dashboardData.summary.completionRate >= 70 : false,
    },
  ];

  const primaryCollectionPath = isServiceBusiness ? '/jobs' : '/jobs/create';

  return (
    <div className="space-y-10">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
            {i18n.language === 'hi'
              ? `नमस्ते, ${profile?.displayName || 'User'}!`
              : `Namaste, ${profile?.displayName || 'User'}!`}
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg">
            {isServiceBusiness ? 'Active Services' : t('active_projects')}: {dashboardData.summary.activeWorkItems} | {isServiceBusiness ? 'Active Staff' : t('total_team')}: {dashboardData.summary.teamSize}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <Link to={primaryCollectionPath} className="btn-secondary flex items-center gap-2 flex-1 md:flex-none justify-center">
            <Plus className="w-5 h-5" />
            {isServiceBusiness ? 'Manage Services' : t('create_new')}
          </Link>
          <Link to="/labor/register" className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 flex-1 md:flex-none justify-center">
            <Plus className="w-5 h-5" />
            {isServiceBusiness ? 'Add Staff' : t('register_new')}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="organic-card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-surface-container-highest">
                <kpi.icon className="w-6 h-6 text-primary" />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
                  kpi.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                )}
              >
                {kpi.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-on-surface-variant font-medium">{kpi.label}</p>
              <h3 className="text-3xl font-bold mt-1">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 organic-card h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold mb-8">Financial Trends</h3>
            <select className="bg-surface-container-high border-none rounded-full px-4 py-2 text-sm font-medium outline-none">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.trends}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9f402d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9f402d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#9f402d" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="organic-card h-[400px] flex flex-col">
          <h3 className="text-xl font-bold mb-8">{isServiceBusiness ? 'Service Margin' : 'Job Profitability'}</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.profitability} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                  {dashboardData.profitability.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {dashboardData.profitability.map((job) => (
              <div key={job.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: job.color }} />
                  <span className="text-on-surface-variant">{job.name}</span>
                </div>
                <span className="font-bold">{job.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="organic-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{isServiceBusiness ? 'Recent Service Activity' : 'Recent Job Activity'}</h3>
            <Link to="/jobs" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-high transition-all cursor-pointer">
                <div className={cn('p-2 rounded-xl', activity.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600')}>
                  {activity.status === 'active' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface">{activity.title}</p>
                  <p className="text-xs text-on-surface-variant">{activity.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">{activity.timeLabel}</p>
                </div>
              </div>
            ))}

            {dashboardData.activities.length === 0 && (
              <div className="rounded-2xl bg-surface-container-high/40 px-4 py-6 text-sm text-on-surface-variant">
                No activity yet. Create your first {isServiceBusiness ? 'service' : 'project'} to get started.
              </div>
            )}
          </div>
        </div>

        <div className="organic-card">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {(isServiceBusiness
              ? [
                  { label: 'Manage Services', icon: Briefcase, color: 'bg-blue-50 text-blue-600', path: '/jobs' },
                  { label: 'Bookings & Reports', icon: ArrowUpRight, color: 'bg-purple-50 text-purple-600', path: '/reports' },
                  { label: 'Manage Staff', icon: Users, color: 'bg-teal-50 text-teal-600', path: '/labor' },
                  { label: 'Business Settings', icon: Settings, color: 'bg-gray-50 text-gray-600', path: '/settings' },
                ]
              : [
                  { label: 'Generate Invoice', icon: FileText, color: 'bg-blue-50 text-blue-600', path: '/invoice' },
                  { label: 'Export Reports', icon: ArrowUpRight, color: 'bg-purple-50 text-purple-600', path: '/reports' },
                  { label: 'Manage Team', icon: Users, color: 'bg-teal-50 text-teal-600', path: '/labor' },
                  { label: 'System Settings', icon: Settings, color: 'bg-gray-50 text-gray-600', path: '/settings' },
                ]).map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-container-high/50 hover:bg-surface-container-high transition-all gap-3"
              >
                <div className={cn('p-4 rounded-2xl', action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-on-surface">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
