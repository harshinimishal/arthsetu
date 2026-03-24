import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Week 1', cashflow: 4000 },
  { name: 'Week 2', cashflow: 3000 },
  { name: 'Week 3', cashflow: 2000 },
  { name: 'Week 4', cashflow: 2780 },
  { name: 'Week 5', cashflow: 1890 },
  { name: 'Week 6', cashflow: 2390 },
];

const transactions = [
  { id: '1', date: '24 Mar 2024', description: 'Cement Purchase (50 Bags)', amount: 18500, type: 'debit', category: 'Material' },
  { id: '2', date: '22 Mar 2024', description: 'Client Advance Payment', amount: 150000, type: 'credit', category: 'Income' },
  { id: '3', date: '20 Mar 2024', description: 'Weekly Labor Payout', amount: 45200, type: 'debit', category: 'Labor' },
  { id: '4', date: '18 Mar 2024', description: 'Equipment Rental', amount: 12000, type: 'debit', category: 'Equipment' },
];

export default function JobDetails() {
  const { id } = useParams();

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/jobs" className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all">
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-on-surface">Metro Line 3 Foundation</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>MMRDA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Bandra, Mumbai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Started Jan 15, 2024</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold">
            Edit Project
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Budget', value: '₹12.5L', icon: TrendingUp, color: 'text-primary' },
          { label: 'Total Spent', value: '₹4.5L', icon: ArrowDownRight, color: 'text-red-500' },
          { label: 'Active Workers', value: '45', icon: Users, color: 'text-tertiary' },
          { label: 'Completion', value: '35%', icon: CheckCircle2, color: 'text-green-500' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="organic-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-surface-container-highest">
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
              <button className="p-2 hover:bg-surface-container-highest rounded-lg transition-all">
                <MoreVertical className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant font-medium">{card.label}</p>
            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Financials & Transactions */}
        <section className="lg:col-span-2 space-y-8">
          <div className="organic-card h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Project Cashflow</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Weekly Spend
                </div>
              </div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="cashflow" stroke="#9f402d" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="organic-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Transaction History</h3>
              <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      tx.type === 'credit' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {tx.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{tx.description}</p>
                      <p className="text-xs text-on-surface-variant">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-lg",
                      tx.type === 'credit' ? "text-green-600" : "text-red-600"
                    )}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column - Team & Info */}
        <section className="space-y-8">
          <div className="organic-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Active Team</h3>
              <button className="p-2 bg-surface-container-highest rounded-xl hover:bg-outline/10 transition-all">
                <Plus className="w-4 h-4 text-primary" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Amit Sharma', role: 'Mason', status: 'present' },
                { name: 'Suresh Kumar', role: 'Electrician', status: 'present' },
                { name: 'Rahul Verma', role: 'Plumber', status: 'absent' },
                { name: 'Vikram Singh', role: 'Helper', status: 'present' },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-high/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{member.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">{member.role}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    member.status === 'present' ? "bg-green-500" : "bg-red-500"
                  )} />
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-surface-container-highest text-on-surface font-bold text-sm rounded-2xl hover:bg-outline/10 transition-all">
              Manage Workforce
            </button>
          </div>

          <div className="organic-card bg-tertiary text-white">
            <h3 className="text-xl font-bold mb-6">Project Milestones</h3>
            <div className="space-y-6">
              {[
                { label: 'Foundation Excavation', date: 'Jan 20', completed: true },
                { label: 'Piling Work', date: 'Feb 15', completed: true },
                { label: 'Column Casting', date: 'Mar 10', completed: true },
                { label: 'Slab Reinforcement', date: 'Apr 05', completed: false },
              ].map((milestone, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      milestone.completed ? "bg-white text-tertiary" : "border-2 border-white/30 text-white/30"
                    )}>
                      {milestone.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    {i < 3 && <div className="w-0.5 h-10 bg-white/20 my-1" />}
                  </div>
                  <div className="pt-0.5">
                    <p className={cn("font-bold text-sm", milestone.completed ? "text-white" : "text-white/50")}>
                      {milestone.label}
                    </p>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
