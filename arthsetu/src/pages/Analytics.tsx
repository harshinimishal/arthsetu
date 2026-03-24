import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  ChevronRight,
  MapPin,
  Briefcase,
  Users,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
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
  PieChart,
  Pie
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, expense: 2400 },
  { name: 'Feb', revenue: 3000, expense: 1398 },
  { name: 'Mar', revenue: 2000, expense: 9800 },
  { name: 'Apr', revenue: 2780, expense: 3908 },
  { name: 'May', revenue: 1890, expense: 4800 },
  { name: 'Jun', revenue: 2390, expense: 3800 },
];

const jobProfitData = [
  { name: 'Metro Project', value: 45, color: '#9f402d' },
  { name: 'Mall Renovation', value: 30, color: '#fe9832' },
  { name: 'Road Repair', value: 25, color: '#006972' },
];

const regionalData = [
  { name: 'Mumbai', value: 55, color: '#9f402d' },
  { name: 'Thane', value: 25, color: '#fe9832' },
  { name: 'Pune', value: 20, color: '#006972' },
];

export default function Analytics() {
  const { t } = useTranslation();

  const kpis = [
    { label: t('total_revenue'), value: '24.5%', change: '+2.1%', icon: TrendingUp, positive: true },
    { label: t('projects'), value: '45 Days', change: '-5 Days', icon: Briefcase, positive: true },
    { label: t('team'), value: '92%', change: '+4.5%', icon: Users, positive: true },
    { label: t('pending_payouts'), value: '₹750', change: '+₹25', icon: TrendingDown, positive: false },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{t('dashboard')}</h2>
          <p className="text-on-surface-variant text-base md:text-lg">{t('manage_preferences')}</p>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold flex-1 md:flex-none justify-center">
            <BarChart3 className="w-4 h-4" />
            {t('reports')}
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 flex-1 md:flex-none justify-center">
            <ArrowUpRight className="w-5 h-5" />
            {t('save_changes')}
          </button>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="bg-orange-50 border border-orange-100 p-4 md:p-6 rounded-3xl flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="p-4 rounded-2xl bg-orange-100 text-orange-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-lg font-bold text-orange-900">Budget Alert: Metro Line 3 Foundation</h4>
          <p className="text-orange-800 text-sm">Project expenses have exceeded 90% of the allocated budget. Immediate review required.</p>
        </div>
        <button className="w-full md:w-auto px-6 py-3 bg-orange-900 text-white rounded-2xl font-bold text-sm hover:bg-orange-800 transition-all">
          Review Project
        </button>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Profit Margin', value: '24.5%', change: '+2.1%', icon: TrendingUp, positive: true },
          { label: 'Avg. Job Duration', value: '45 Days', change: '-5 Days', icon: Briefcase, positive: true },
          { label: 'Worker Efficiency', value: '92%', change: '+4.5%', icon: Users, positive: true },
          { label: 'Cost Per Worker', value: '₹750', change: '+₹25', icon: TrendingDown, positive: false },
        ].map((kpi, i) => (
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
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                kpi.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
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

      {/* Main Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 organic-card h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Revenue vs Expense Trends</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Revenue
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-tertiary" />
                Expense
              </div>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9f402d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9f402d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006972" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#006972" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#9f402d" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expense" stroke="#006972" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="organic-card h-[450px] flex flex-col">
          <h3 className="text-xl font-bold mb-8">Regional Performance</h3>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Total Jobs</p>
              <p className="text-3xl font-bold">156</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {regionalData.map(region => (
              <div key={region.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }} />
                  <span className="text-on-surface-variant">{region.name}</span>
                </div>
                <span className="font-bold">{region.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="organic-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Job Profitability Analysis</h3>
            <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              Full Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-6">
            {jobProfitData.map((job, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-on-surface">{job.name}</span>
                  <span className="font-bold text-primary">{job.value}% Profit</span>
                </div>
                <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${job.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: job.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="organic-card">
          <h3 className="text-xl font-bold mb-6">Top Performing Regions</h3>
          <div className="space-y-4">
            {[
              { region: 'Mumbai South', jobs: 45, revenue: '₹45.2L', trend: 'up' },
              { region: 'Thane West', jobs: 28, revenue: '₹22.8L', trend: 'up' },
              { region: 'Pune Central', jobs: 15, revenue: '₹18.5L', trend: 'down' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{item.region}</p>
                    <p className="text-xs text-on-surface-variant">{item.jobs} Active Jobs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-on-surface">{item.revenue}</p>
                  <div className={cn(
                    "flex items-center justify-end gap-1 text-[10px] font-bold uppercase",
                    item.trend === 'up' ? "text-green-600" : "text-red-600"
                  )}>
                    {item.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {item.trend === 'up' ? 'Growing' : 'Declining'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
