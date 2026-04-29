import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Flag,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  X,
  ChevronRight,
  Bell
} from 'lucide-react';
import { authService } from '../shared/auth/authService';
import { usePageActions } from '../shared/contexts/PageActionsContext';

const sidebarItems = [
  { path: '/platform', label: 'Башкы бет', icon: LayoutDashboard },
  { path: '/platform/tenants', label: 'Тенанттар', icon: Building2 },
  { path: '/platform/users', label: 'Платформа колдонуучулары', icon: Users },
  { path: '/platform/plans', label: 'Тарифтер', icon: CreditCard },
  { path: '/platform/feature-flags', label: 'Функциялар', icon: Flag },
  { path: '/platform/demo-requests', label: 'CRM Демо Сурамдары', icon: MessageSquare },
  { path: '/platform/audit-logs', label: 'Аудит логдор', icon: FileText },
  { path: '/platform/settings', label: 'Жөндөөлөр', icon: Settings },
];

export function PlatformLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const { actions } = usePageActions();
  const authUser = authService.getCurrentUser();
  const currentUser = authUser
    ? { name: authUser.email.split('@')[0] || 'Админ', email: authUser.email }
    : null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
        setTimeout(() => {
          const searchInput = document.querySelector('#global-search-input') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen]);

  const handleLogout = () => {
    void authService.logout();
    navigate('/login');
  };

  const filteredSidebarItems = sidebarItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0 || pathSegments[0] === 'platform') {
      return [{ label: 'Башкы бет', path: '/platform' }];
    }

    const breadcrumbs = [{ label: 'Башкы бет', path: '/platform' }];
    let currentPath = '';

    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += '/' + pathSegments[i];
      const sidebarItem = sidebarItems.find(item =>
        item.path === currentPath || (item.path !== '/platform' && currentPath.startsWith(item.path))
      );

      if (sidebarItem && (i === pathSegments.length - 1 || sidebarItem.path === currentPath)) {
        breadcrumbs.push({ label: sidebarItem.label, path: sidebarItem.path });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-30 ${isMobile
          ? sidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full'
          : sidebarOpen
            ? 'w-64'
            : 'w-16'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className={`font-bold text-gray-900 ${sidebarOpen ? 'text-lg' : 'text-xs text-center'}`}>
              {sidebarOpen ? 'Edubot Admin' : 'EA'}
            </h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Жабуу"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Search */}
          {sidebarOpen && (
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Издөө..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/platform' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            {/* User Profile Section */}
            {currentUser && (
              <div className="mb-3">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  {sidebarOpen && (
                    <>
                      <div className="ml-3 flex-1 text-left">
                        <div className="font-medium text-gray-900">{currentUser.name}</div>
                        <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && sidebarOpen && (
                  <div className="mt-2 ml-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => navigate('/platform/settings')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Жөндөөлөр
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-semantic-error-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Чыгуу
                    </button>
                  </div>
                )}
              </div>
            )}

            {!userDropdownOpen && (
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">Чыгуу</span>}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ease-in-out ${isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16'
          }`}
      >
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={sidebarOpen ? 'Жабуу' : 'Меню'}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />}
                    {index === getBreadcrumbs().length - 1 ? (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Page-level Actions */}
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${action.variant === 'primary'
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : action.variant === 'danger'
                      ? 'bg-semantic-error-600 text-white hover:bg-semantic-error-700'
                      : action.variant === 'secondary'
                        ? 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}

              {/* Global Search */}
              <button
                onClick={() => setGlobalSearchOpen(true)}
                className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Глобалдык издөө"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Издөө...</span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-white border border-gray-300 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Bell */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Билдирүүлөр">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-semantic-error-500 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Колдонуучу менюсу"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {currentUser?.name.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {currentUser?.name || 'Админ'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => navigate('/platform/settings')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Жөндөөлөр
                    </button>
                    <button
                      onClick={() => navigate('/platform/settings')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Жөндөөлөр
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-semantic-error-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Чыгуу
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Global Search Modal */}
      {globalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setGlobalSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="global-search-input"
                  type="text"
                  placeholder="Глобалдык издөө..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-lg border-0 focus:outline-none focus:ring-0"
                  autoFocus
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                  ESC
                </kbd>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {globalSearchQuery ? (
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">Натыйжалар</p>
                  {filteredSidebarItems.length > 0 ? (
                    filteredSidebarItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setGlobalSearchOpen(false);
                          setGlobalSearchQuery('');
                        }}
                        className="flex items-center w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <item.icon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{item.label}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Натыйжа табылган жок</p>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">Тез ылдамдык</p>
                  <div className="space-y-1">
                    {sidebarItems.slice(0, 5).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setGlobalSearchOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <item.icon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
