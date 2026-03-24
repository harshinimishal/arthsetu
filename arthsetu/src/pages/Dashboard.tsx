import { 
  Plus, 
  TrendingUp, 
  Users, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
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
  Cell
} from 'recharts';

const data = [
  { name: 'Mon', income: 4000, expense: 2400 },
  { name: 'Tue', income: 3000, expense: 1398 },
  { name: 'Wed', income: 2000, expense: 9800 },
  { name: 'Thu', income: 2780, expense: 3908 },
  { name: 'Fri', income: 1890, expense: 4800 },
  { name: 'Sat', income: 2390, expense: 3800 },
  { name: 'Sun', income: 3490, expense: 4300 },
];

const jobData = [
  { name: 'Metro Project', value: 45, color: '#9f402d' },
  { name: 'Mall Renovation', value: 30, color: '#fe9832' },
  { name: 'Road Repair', value: 25, color: '#006972' },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Namaste, Rajesh!</h2>
          <p className="text-on-surface-variant text-lg">You have 3 active jobs and 45 workers on-site today.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Job Entry
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5" />
            Add New Worker
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '₹12.4L', change: '+12.5%', icon: TrendingUp, positive: true },
          { label: 'Active Jobs', value: '03', change: 'On Track', icon: Briefcase, positive: true },
          { label: 'Total Workers', value: '156', change: '+12 Today', icon: Users, positive: true },
          { label: 'Pending Payouts', value: '₹45,000', change: '-₹5,000', icon: Clock, positive: false },
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

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 organic-card h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Financial Trends</h3>
            <select className="bg-surface-container-high border-none rounded-full px-4 py-2 text-sm font-medium outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9f402d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9f402d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#9f402d" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="organic-card h-[400px] flex flex-col">
          <h3 className="text-xl font-bold mb-8">Job Profitability</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                  {jobData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {jobData.map(job => (
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

      {/* Recent Activity & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="organic-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Job Activity</h3>
            <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Material Delivered', job: 'Metro Project', time: '2 hours ago', status: 'completed' },
              { title: 'Worker Payouts', job: 'Mall Renovation', time: '5 hours ago', status: 'pending' },
              { title: 'Site Inspection', job: 'Road Repair', time: 'Yesterday', status: 'completed' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-high transition-all cursor-pointer">
                <div className={cn(
                  "p-2 rounded-xl",
                  activity.status === 'completed' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                )}>
                  {activity.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface">{activity.title}</p>
                  <p className="text-xs text-on-surface-variant">{activity.job}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="organic-card">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Generate Invoice', icon: FileText, color: 'bg-blue-50 text-blue-600' },
              { label: 'Export Reports', icon: ArrowUpRight, color: 'bg-purple-50 text-purple-600' },
              { label: 'Manage Team', icon: Users, color: 'bg-teal-50 text-teal-600' },
              { label: 'System Settings', icon: Settings, color: 'bg-gray-50 text-gray-600' },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-container-high/50 hover:bg-surface-container-high transition-all gap-3">
                <div className={cn("p-4 rounded-2xl", action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-on-surface">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
