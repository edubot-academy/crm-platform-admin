import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PlatformProtectedRoute } from '../shared/auth/PlatformProtectedRoute';
import { PlatformLayout } from '../layouts/PlatformLayout';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const PlatformDashboardPage = lazy(() => import('../features/dashboard/PlatformDashboardPage').then(m => ({ default: m.PlatformDashboardPage })));
const TenantsPage = lazy(() => import('../features/tenants/TenantsPage').then(m => ({ default: m.TenantsPage })));
const CreateTenantPage = lazy(() => import('../features/tenants/CreateTenantPage').then(m => ({ default: m.CreateTenantPage })));
const TenantDetailPage = lazy(() => import('../features/tenants/TenantDetailPage').then(m => ({ default: m.TenantDetailPage })));
const PlatformUsersPage = lazy(() => import('../features/platform-users/PlatformUsersPage').then(m => ({ default: m.PlatformUsersPage })));
const PlatformFeatureFlagsPage = lazy(() => import('../features/feature-flags/PlatformFeatureFlagsPage').then(m => ({ default: m.PlatformFeatureFlagsPage })));
const PlansPage = lazy(() => import('../features/plans/PlansPage').then(m => ({ default: m.PlansPage })));
const AuditLogsPage = lazy(() => import('../features/audit-logs/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const PlatformSettingsPage = lazy(() => import('../features/settings/PlatformSettingsPage').then(m => ({ default: m.PlatformSettingsPage })));
const DemoRequestsPage = lazy(() => import('../features/demo-requests/DemoRequestsPage').then(m => ({ default: m.DemoRequestsPage })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/platform',
    element: (
      <PlatformProtectedRoute>
        <PlatformLayout />
      </PlatformProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PlatformDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'tenants',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TenantsPage />
          </Suspense>
        ),
      },
      {
        path: 'tenants/new',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreateTenantPage />
          </Suspense>
        ),
      },
      {
        path: 'tenants/:tenantId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TenantDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PlatformUsersPage />
          </Suspense>
        ),
      },
      {
        path: 'feature-flags',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PlatformFeatureFlagsPage />
          </Suspense>
        ),
      },
      {
        path: 'plans',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PlansPage />
          </Suspense>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AuditLogsPage />
          </Suspense>
        ),
      },
      {
        path: 'demo-requests',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DemoRequestsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PlatformSettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
