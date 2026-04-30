import { Badge } from '../../shared/components/Badge';
import { Globe, CreditCard, Users, Settings, FileText } from 'lucide-react';

export const TENANT_DETAIL_TABS = [
  { id: 'overview', label: 'Жалпы маалымат', icon: Globe },
  { id: 'domains', label: 'Домендер', icon: Globe },
  { id: 'plan', label: 'Тариф жана функциялар', icon: CreditCard },
  { id: 'users', label: 'Колдонуучулар', icon: Users },
  { id: 'settings', label: 'Жөндөөлөр', icon: Settings },
  { id: 'audit', label: 'Аудит', icon: FileText },
] as const;

export const TENANT_INFO_ROW_CLASSES = 'mt-1 text-sm text-edubot-ink';

export function renderTenantStatusBadge(status: string) {
  const variant = status === 'active' ? 'success' : status === 'suspended' ? 'danger' : status === 'archived' ? 'neutral' : 'warning';
  const label = status === 'active' ? 'Активдүү' : status === 'suspended' ? 'Токтотулган' : status === 'archived' ? 'Архивделген' : 'Актив эмес';
  return <Badge variant={variant}>{label}</Badge>;
}

export function renderDomainStatusBadge(status: string) {
  const variant = status === 'active' ? 'success' : status === 'pending' ? 'warning' : status === 'failed' ? 'danger' : 'neutral';
  const label = status === 'active' ? 'Активдүү' : status === 'pending' ? 'Күтүүдө' : status === 'failed' ? 'Иштебей калган' : 'Өчүрүлгөн';
  return <Badge variant={variant}>{label}</Badge>;
}

export function renderDomainTypeBadge(type: string) {
  const variant = type === 'default' ? 'neutral' : 'info';
  const label = type === 'default' ? 'Жарыяланган' : 'Кастом';
  return <Badge variant={variant}>{label}</Badge>;
}

export function renderUserStatusBadge(isActive: boolean) {
  const variant = isActive ? 'success' : 'warning';
  const label = isActive ? 'Активдүү' : 'Актив эмес';
  return <Badge variant={variant}>{label}</Badge>;
}

export function renderUserRoleBadge(role: string) {
  const variant = role === 'admin' ? 'success' : role === 'manager' ? 'info' : role === 'sales' ? 'warning' : 'neutral';
  const label = role === 'admin' ? 'Админ' : role === 'manager' ? 'Менеджер' : role === 'sales' ? 'Сатуу адиси' : 'Ассистент';
  return <Badge variant={variant}>{label}</Badge>;
}

export function renderSuccessBadge(label: string) {
  return <Badge variant="success">{label}</Badge>;
}
