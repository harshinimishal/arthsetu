import { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Calendar,
  ChevronRight,
  MoreVertical,
  Briefcase,
  User,
  IndianRupee
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

const transactions = [
  { id: '1', type: 'debit', amount: 45000, category: 'Material', job: 'Metro Line 3 Foundation', date: '24 Mar 2024', status: 'completed', recipient: 'UltraTech Cement' },
  { id: '2', type: 'debit', amount: 12500, category: 'Labor', job: 'Phoenix Mall Renovation', date: '24 Mar 2024', status: 'completed', recipient: 'Amit Sharma' },
  { id: '3', type: 'credit', amount: 250000, category: 'Client Payment', job: 'Metro Line 3 Foundation', date: '23 Mar 2024', status: 'completed', recipient: 'MMRDA' },
  { id: '4', type: 'debit', amount: 8500, category: 'Equipment', job: 'Residential Complex B', date: '22 Mar 2024', status: 'pending', recipient: 'JCB Rentals' },
  { id: '5', type: 'debit', amount: 32000, category: 'Material', job: 'Highway Expansion P-2', date: '21 Mar 2024', status: 'completed', recipient: 'Tata Steel' },
  { id: '6', type: 'credit', amount: 150000, category: 'Client Payment', job: 'Phoenix Mall Renovation', date: '20 Mar 2024', status: 'completed', recipient: 'Phoenix Mills' },
];

export default function Transactions() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.recipient.toLowerCase().includes(search.toLowerCase()) || 
                          t.job.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{t('transactions')}</h2>
          <p className="text-on-surface-variant text-base md:text-lg">{t('manage_preferences')}</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold justify-center">
          <Download className="w-4 h-4" />
          {t('reports')}
        </button>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: t('total_revenue'), value: '₹4,00,000', icon: ArrowDownLeft, color: 'text-green-600', bg: 'bg-green-50' },
          { label: t('pending_payouts'), value: '₹98,000', icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50' },
          { label: t('dashboard'), value: '₹3,02,000', icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/5' },
        ].map((stat, i) => (
          <div key={i} className="organic-card flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Filters & Search */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-surface-container p-1 rounded-2xl w-full md:w-auto">
          {['all', 'credit', 'debit'].map((f) => (
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

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all">
            <Filter className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </section>

      {/* Transactions List */}
      <section className="organic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Transaction Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Project</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {filteredTransactions.map((tx, i) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-container-high/30 transition-all group"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{tx.recipient}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                        }`}>{tx.status}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Briefcase className="w-4 h-4" />
                      <span>{tx.job}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Calendar className="w-4 h-4" />
                      <span>{tx.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className={`text-lg font-bold ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-on-surface'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2 hover:bg-surface-container-highest rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                    </button>
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
