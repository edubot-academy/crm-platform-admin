import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { PlatformProtectedRoute } from '../shared/auth/PlatformProtectedRoute';
import { PlatformLayout } from '../layouts/PlatformLayout';
import { PlatformDashboardPage } from '../features/dashboard/PlatformDashboardPage';
import { TenantsPage } from '../features/tenants/TenantsPage';
import { CreateTenantPage } from '../features/tenants/CreateTenantPage';
import { TenantDetailPage } from '../features/tenants/TenantDetailPage';
import { PlatformUsersPage } from '../features/platform-users/PlatformUsersPage';
import { PlatformFeatureFlagsPage } from '../features/feature-flags/PlatformFeatureFlagsPage';
import { PlansPage } from '../features/plans/PlansPage';
import { AuditLogsPage } from '../features/audit-logs/AuditLogsPage';
import { PlatformSettingsPage } from '../features/settings/PlatformSettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
        element: <PlatformDashboardPage />,
      },
      {
        path: 'tenants',
        element: <TenantsPage />,
      },
      {
        path: 'tenants/new',
        element: <CreateTenantPage />,
      },
      {
        path: 'tenants/:tenantId',
        element: <TenantDetailPage />,
      },
      {
        path: 'users',
        element: <PlatformUsersPage />,
      },
      {
        path: 'feature-flags',
        element: <PlatformFeatureFlagsPage />,
      },
      {
        path: 'plans',
        element: <PlansPage />,
      },
      {
        path: 'audit-logs',
        element: <AuditLogsPage />,
      },
      {
        path: 'settings',
        element: <PlatformSettingsPage />,
      },
    ],
  },
]);
