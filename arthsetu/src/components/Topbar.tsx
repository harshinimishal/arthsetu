import { Search, Bell, Globe, User } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-20 glass border-b border-outline/10 flex items-center justify-between px-10 fixed top-0 right-0 left-64 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search jobs, workers, or reports..." 
            className="w-full pl-12 pr-6 py-3 bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-surface-container-high transition-all">
          <Globe className="w-5 h-5 text-on-surface-variant" />
          <span className="text-sm font-medium">English</span>
        </button>

        <div className="relative">
          <button className="p-3 rounded-full hover:bg-surface-container-high transition-all relative">
            <Bell className="w-5 h-5 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary-container rounded-full border-2 border-surface" />
          </button>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-outline/10">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">Rajesh Kumar</p>
            <p className="text-xs text-on-surface-variant">Senior Contractor</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden border border-outline/10">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
