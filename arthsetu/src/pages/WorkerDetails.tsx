import { useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  UserCheck,
  CreditCard
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

const attendanceData = [
  { name: 'Week 1', present: 6 },
  { name: 'Week 2', present: 5 },
  { name: 'Week 3', present: 6 },
  { name: 'Week 4', present: 4 },
  { name: 'Week 5', present: 6 },
  { name: 'Week 6', present: 5 },
];

const payoutHistory = [
  { id: '1', date: '24 Mar 2024', amount: 5950, status: 'success', job: 'Metro Line 3' },
  { id: '2', date: '17 Mar 2024', amount: 5100, status: 'success', job: 'Metro Line 3' },
  { id: '3', date: '10 Mar 2024', amount: 4250, status: 'success', job: 'Metro Line 3' },
  { id: '4', date: '03 Mar 2024', amount: 5950, status: 'success', job: 'Phoenix Mall' },
];

export default function WorkerDetails() {
  const { id } = useParams();

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/labor" className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all shrink-0">
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">Amit Sharma</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Mason</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Dharavi, Mumbai</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold flex-1 md:flex-none justify-center">
            Edit Profile
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 flex-1 md:flex-none justify-center">
            <CreditCard className="w-5 h-5" />
            Process Payout
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Daily Wage', value: '₹850', icon: TrendingUp, color: 'text-primary' },
          { label: 'Total Earned', value: '₹42,500', icon: ArrowUpRight, color: 'text-green-500' },
          { label: 'Attendance Rate', value: '95%', icon: UserCheck, color: 'text-tertiary' },
          { label: 'Pending Dues', value: '₹0', icon: CheckCircle2, color: 'text-blue-500' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
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
        {/* Left Column - Attendance & History */}
        <section className="lg:col-span-2 space-y-8">
          <div className="organic-card h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Attendance Trend (Days/Week)</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Days Present
                </div>
              </div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="present" stroke="#9f402d" strokeWidth={3} fillOpacity={1} fill="url(#colorAttend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="organic-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Payout History</h3>
              <Link to="/transactions" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {payoutHistory.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">₹{payout.amount.toLocaleString()}</p>
                      <p className="text-xs text-on-surface-variant">{payout.date} • {payout.job}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column - Personal Info & Documents */}
        <section className="space-y-8">
          <div className="organic-card">
            <h3 className="text-xl font-bold mb-6">Personal Details</h3>
            <div className="space-y-6">
              {[
                { label: 'Email', value: 'amit.sharma@email.com', icon: Mail },
                { label: 'Emergency Contact', value: '+91 98765 00000', icon: Phone },
                { label: 'Address', value: 'Room 402, Building 12, Dharavi Sector 3, Mumbai', icon: MapPin },
                { label: 'Joined Date', value: 'Jan 10, 2023', icon: Calendar },
              ].map((info, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-surface-container-highest text-primary">
                    <info.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{info.label}</p>
                    <p className="text-sm font-medium text-on-surface">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="organic-card bg-tertiary text-white">
            <h3 className="text-xl font-bold mb-6">Documents</h3>
            <div className="space-y-4">
              {[
                { label: 'Aadhar Card', status: 'Verified' },
                { label: 'Bank Passbook', status: 'Verified' },
                { label: 'Labor License', status: 'Pending' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={cn("w-5 h-5", doc.status === 'Verified' ? "text-white" : "text-white/30")} />
                    <span className="text-sm font-bold">{doc.label}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{doc.status}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-white text-tertiary font-bold text-sm rounded-2xl hover:bg-secondary-container hover:text-on-surface transition-all">
              Upload New Document
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
