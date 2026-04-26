import { Navigate } from 'react-router-dom';
import { authService } from './authService';

interface PlatformProtectedRouteProps {
  children: React.ReactNode;
}

export function PlatformProtectedRoute({ children }: PlatformProtectedRouteProps) {
  const isAuth = authService.isSuperAdmin();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
