import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Search,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export default function Reports() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('financial');

  const reportTypes = [
    { id: 'financial', label: t('total_revenue'), icon: FileText, description: 'Revenue, expenses, and profit margins.' },
    { id: 'labor', label: t('team'), icon: FileSpreadsheet, description: 'Worker attendance and wage payouts.' },
    { id: 'job', label: t('projects'), icon: FileJson, description: 'Project timelines and budget utilization.' },
    { id: 'tax', label: t('reports'), icon: FileText, description: 'GST and other regulatory reports.' },
  ];

  const recentExports = [
    { id: '1', name: 'Monthly_Financial_Feb24.pdf', date: '24 Mar 2024', size: '2.4 MB', status: 'completed' },
    { id: '2', name: 'Worker_Attendance_Week12.xlsx', date: '22 Mar 2024', size: '1.1 MB', status: 'completed' },
    { id: '3', name: 'Metro_Project_Audit.pdf', date: '20 Mar 2024', size: '5.8 MB', status: 'processing' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{t('reports')}</h2>
          <p className="text-on-surface-variant text-base md:text-lg">{t('manage_preferences')}</p>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 w-full md:w-auto justify-center">
          <Download className="w-5 h-5" />
          {t('save_changes')}
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Types */}
        <section className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-bold mb-6">Select Report Type</h3>
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                "w-full text-left p-6 rounded-3xl transition-all duration-300 flex items-center gap-6",
                selectedType === type.id 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl",
                selectedType === type.id ? "bg-white/20" : "bg-surface-container-highest"
              )}>
                <type.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold">{type.label}</p>
                <p className={cn(
                  "text-xs mt-1",
                  selectedType === type.id ? "text-white/70" : "text-on-surface-variant"
                )}>{type.description}</p>
              </div>
              <ChevronRight className={cn(
                "w-5 h-5",
                selectedType === type.id ? "text-white" : "text-on-surface-variant"
              )} />
            </button>
          ))}
        </section>

        {/* Report Configuration & Preview */}
        <section className="lg:col-span-2 space-y-8">
          <div className="organic-card space-y-8">
            <h3 className="text-xl font-bold">Configure Report</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Date Range</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <select className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-medium">
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>Financial Year 2023-24</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Project Filter</label>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <select className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-medium">
                    <option>All Projects</option>
                    <option>Metro Line 3 Foundation</option>
                    <option>Phoenix Mall Renovation</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-6 py-3 bg-surface-container-highest rounded-2xl font-bold text-sm hover:bg-outline/10 transition-all">
                  Preview Report
                </button>
                <button className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Generate PDF
                </button>
              </div>
              <button className="text-primary font-bold text-sm hover:underline">
                Advanced Options
              </button>
            </div>
          </div>

          <div className="organic-card">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold">Recent Exports</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Search exports..." 
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-high rounded-xl border-none text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              {recentExports.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-high transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{exportItem.name}</p>
                      <p className="text-xs text-on-surface-variant">{exportItem.date} • {exportItem.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase",
                      exportItem.status === 'completed' ? "text-green-600" : "text-orange-600"
                    )}>
                      {exportItem.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {exportItem.status}
                    </div>
                    <button className="p-2 hover:bg-surface-container-highest rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Download className="w-4 h-4 text-primary" />
                    </button>
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
