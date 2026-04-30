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
  { path: '/platform', label: 'Жалпы көрүнүш', icon: LayoutDashboard },
  { path: '/platform/tenants', label: 'Уюмдар', icon: Building2 },
  { path: '/platform/users', label: 'Платформа админдери', icon: Users },
  { path: '/platform/plans', label: 'Тарифтер', icon: CreditCard },
  { path: '/platform/feature-flags', label: 'Функциялар', icon: Flag },
  { path: '/platform/demo-requests', label: 'Демо сурамдар', icon: MessageSquare },
  { path: '/platform/audit-logs', label: 'Аудит журналдары', icon: FileText },
  { path: '/platform/settings', label: 'Жөндөөлөр', icon: Settings },
];

export function PlatformLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarUserDropdownOpen, setSidebarUserDropdownOpen] = useState(false);
  const [headerUserDropdownOpen, setHeaderUserDropdownOpen] = useState(false);
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

  const filteredGlobalSearchItems = sidebarItems.filter(item =>
    item.label.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const getBreadcrumbs = () => {
    if (location.pathname === '/platform') {
      return [{ label: 'Башкы бет', path: '/platform' }];
    }

    const pathSegments = location.pathname
      .split('/')
      .filter(Boolean)
      .slice(1);
    const breadcrumbs = [{ label: 'Башкы бет', path: '/platform' }];
    let currentPath = '/platform';

    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const sidebarItem = sidebarItems.find(item =>
        item.path === currentPath
      );

      if (sidebarItem) {
        breadcrumbs.push({ label: sidebarItem.label, path: sidebarItem.path });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full border-r border-edubot-line/80 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${isMobile
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
          <div className="flex items-center justify-between border-b border-edubot-line/80 p-4">
            <h1 className={`font-bold text-edubot-dark ${sidebarOpen ? 'text-lg' : 'text-xs text-center'}`}>
              {sidebarOpen ? 'Edubot Платформа' : 'EP'}
            </h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 transition-colors hover:bg-edubot-orange/10"
                aria-label="Жабуу"
              >
                <X className="w-5 h-5 text-edubot-muted" />
              </button>
            )}
          </div>

          {/* Search */}
          {sidebarOpen && (
            <div className="border-b border-edubot-line/80 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Издөө..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dashboard-field w-full pl-10 pr-4"
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
                    ? 'bg-edubot-orange/10 text-edubot-orange'
                    : 'text-slate-700 hover:bg-edubot-orange/10 hover:text-edubot-orange'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-edubot-line/80 p-4">
            {/* User Profile Section */}
            {currentUser && (
              <div className="mb-3">
                <button
                  onClick={() => setSidebarUserDropdownOpen(!sidebarUserDropdownOpen)}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-edubot-orange/10 hover:text-edubot-orange"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-edubot-orange/10 font-semibold text-edubot-orange">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  {sidebarOpen && (
                    <>
                      <div className="ml-3 flex-1 text-left">
                        <div className="font-medium text-edubot-dark">{currentUser.name}</div>
                        <div className="truncate text-xs text-edubot-muted">{currentUser.email}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${sidebarUserDropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* User Dropdown */}
                {sidebarUserDropdownOpen && sidebarOpen && (
                  <div className="mt-2 ml-3 overflow-hidden rounded-2xl border border-edubot-line bg-white shadow-edubot-card">
                    <button
                      onClick={() => {
                        setSidebarUserDropdownOpen(false);
                        navigate('/platform/settings');
                      }}
                      className="flex w-full items-center px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-edubot-surface"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Жөндөөлөр
                    </button>
                    <button
                      onClick={() => {
                        setSidebarUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center border-t border-edubot-line px-3 py-2 text-sm text-semantic-error-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Чыгуу
                    </button>
                  </div>
                )}
              </div>
            )}

            {!sidebarUserDropdownOpen && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-edubot-orange/10 hover:text-edubot-orange"
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
        <header className="sticky top-0 z-30 border-b border-edubot-line/80 bg-white/80 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-xl p-2 transition-colors hover:bg-edubot-orange/10"
                aria-label={sidebarOpen ? 'Жабуу' : 'Меню'}
              >
                <svg
                  className="w-5 h-5 text-edubot-muted"
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
              {isMobile ? (
                <div className="min-w-0">
                  <span className="block truncate text-base font-semibold text-edubot-dark">
                    {currentBreadcrumb?.label || 'Жалпы көрүнүш'}
                  </span>
                </div>
              ) : (
                <nav className="flex min-w-0 items-center space-x-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex min-w-0 items-center">
                      {index > 0 && <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0 text-gray-400" />}
                      {index === breadcrumbs.length - 1 ? (
                        <span className="truncate font-medium text-edubot-dark">{crumb.label}</span>
                      ) : (
                        <Link
                          to={crumb.path}
                          className="truncate text-edubot-muted transition-colors hover:text-edubot-orange"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
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
                className="hidden items-center space-x-2 rounded-2xl border border-edubot-line bg-white/80 px-3 py-2 transition-colors hover:border-edubot-orange/50 hover:bg-edubot-orange/5 md:flex"
                aria-label="Глобалдык издөө"
              >
                <Search className="w-4 h-4 text-edubot-muted" />
                <span className="text-sm text-edubot-muted">Издөө...</span>
                <kbd className="hidden items-center rounded border border-edubot-line bg-white px-1.5 py-0.5 text-xs font-medium text-edubot-muted lg:inline-flex">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Bell */}
              <button className="relative rounded-xl p-2 transition-colors hover:bg-edubot-orange/10" aria-label="Билдирүүлөр">
                <Bell className="w-5 h-5 text-edubot-muted" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-semantic-error-500 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setHeaderUserDropdownOpen(!headerUserDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-edubot-orange/10"
                  aria-label="Колдонуучу менюсу"
                  aria-expanded={headerUserDropdownOpen}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-edubot-orange/10 font-semibold text-edubot-orange">
                    {currentUser?.name.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="hidden text-sm font-medium text-slate-700 md:block">
                    {currentUser?.name || 'Админ'}
                  </span>
                  <ChevronDown className={`hidden h-4 w-4 text-edubot-muted transition-transform md:block ${headerUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {headerUserDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-edubot-line bg-white py-1 shadow-edubot-card">
                    <button
                      onClick={() => {
                        setHeaderUserDropdownOpen(false);
                        navigate('/platform/settings');
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-edubot-surface"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Жөндөөлөр
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setHeaderUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-semantic-error-600 transition-colors hover:bg-red-50"
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
          <div className="relative w-full max-w-2xl rounded-[1.75rem] border border-edubot-line bg-white shadow-edubot-hover">
            <div className="border-b border-edubot-line p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-edubot-muted" />
                <input
                  id="global-search-input"
                  type="text"
                  placeholder="Глобалдык издөө..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="w-full border-0 bg-transparent py-3 pl-10 pr-4 text-lg focus:outline-none focus:ring-0"
                  autoFocus
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 transform rounded bg-edubot-surface px-2 py-1 text-xs font-medium text-edubot-muted">
                  ESC
                </kbd>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {globalSearchQuery ? (
                <div className="p-4">
                  <p className="mb-2 text-sm text-edubot-muted">Натыйжалар</p>
                  {filteredGlobalSearchItems.length > 0 ? (
                    filteredGlobalSearchItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setGlobalSearchOpen(false);
                          setGlobalSearchQuery('');
                        }}
                        className="flex w-full items-center rounded-xl px-3 py-2 text-left transition-colors hover:bg-edubot-surface"
                      >
                        <item.icon className="mr-3 w-5 h-5 text-edubot-muted" />
                        <span className="text-edubot-dark">{item.label}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-edubot-muted">Натыйжа табылган жок</p>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <p className="mb-2 text-sm text-edubot-muted">Тез өтүү</p>
                  <div className="space-y-1">
                    {sidebarItems.slice(0, 5).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setGlobalSearchOpen(false);
                        }}
                        className="flex w-full items-center rounded-xl px-3 py-2 text-left transition-colors hover:bg-edubot-surface"
                      >
                        <item.icon className="mr-3 w-5 h-5 text-edubot-muted" />
                        <span className="text-edubot-dark">{item.label}</span>
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
