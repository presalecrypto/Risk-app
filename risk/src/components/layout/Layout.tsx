import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  Shield,
  Settings,
  Database,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Plus,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'trades', label: 'الصفقات', icon: TrendingUp },
  { id: 'goals', label: 'الأهداف', icon: Target },
  { id: 'analysis', label: 'تحليل الأداء', icon: BarChart3 },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'risk', label: 'إدارة المخاطر', icon: Shield },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
  { id: 'backup', label: 'النسخ الاحتياطي', icon: Database },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentPage,
    setCurrentPage,
    showMobileMenu,
    setShowMobileMenu,
    theme,
    toggleTheme,
    notifications,
    getUnreadNotifications,
  } = useStore();

  const unreadCount = getUnreadNotifications().length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-bold text-primary-600">Trade Risk Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCurrentPage('notifications')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-30
          w-72 bg-white dark:bg-gray-800
          border-l border-gray-200 dark:border-gray-700
          shadow-lg lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${showMobileMenu ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          lg:top-0 lg:right-auto lg:left-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary-600">Trade Risk Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة المخاطر والأرباح</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={() => {
                setCurrentPage('trades');
                useStore.getState().setShowAddTradeModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة صفقة</span>
            </button>
            
            <div className="flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
