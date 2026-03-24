import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  Receipt,
  ArrowLeftRight,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: Briefcase, label: t('projects'), path: '/jobs' },
    { icon: Users, label: t('team'), path: '/labor' },
    { icon: ArrowLeftRight, label: t('transactions'), path: '/transactions' },
    { icon: BarChart3, label: t('analytics'), path: '/analytics' },
    { icon: Receipt, label: t('reports'), path: '/invoice' },
    { icon: FileText, label: t('reports'), path: '/reports' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  return (
    <aside className={cn(
      "w-64 h-screen glass border-r border-outline/10 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">ArthSetu</h1>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-surface-container-high rounded-xl lg:hidden"
        >
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-outline/10">
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
