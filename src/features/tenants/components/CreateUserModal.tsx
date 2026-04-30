import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import type { CreateTenantUserDto } from '../tenantUsersApi';
import type { FormEvent } from 'react';

interface CreateUserModalProps {
  isOpen: boolean;
  form: CreateTenantUserDto;
  error: string;
  loading: boolean;
  onChange: (form: CreateTenantUserDto) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function CreateUserModal({
  isOpen,
  form,
  error,
  loading,
  onChange,
  onSubmit,
  onClose,
}: CreateUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-edubot-dark/45 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Жаңы колдонуучу кошуу</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <Alert variant="error">{error}</Alert>
              )}
              <Input
                label="Аты-жөнү"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                placeholder="Иван Иванов"
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
              <Select
                label="Роль"
                value={form.role}
                onChange={(value) => onChange({ ...form, role: value as 'admin' | 'manager' | 'sales' | 'assistant' })}
                options={[
                  { value: 'admin', label: 'Админ' },
                  { value: 'manager', label: 'Менеджер' },
                  { value: 'sales', label: 'Сатуу адиси' },
                  { value: 'assistant', label: 'Ассистент' },
                ]}
              />
              <Select
                label="Статус"
                value={form.isActive ? 'active' : 'inactive'}
                onChange={(value) => onChange({ ...form, isActive: value === 'active' })}
                options={[
                  { value: 'active', label: 'Активдүү' },
                  { value: 'inactive', label: 'Актив эмес' },
                ]}
              />
              <div className="flex items-center rounded-2xl border border-edubot-line bg-white/70 px-4 py-3">
                <input
                  type="checkbox"
                  id="sendInvite"
                  checked={form.sendInvite}
                  onChange={(e) => onChange({ ...form, sendInvite: e.target.checked })}
                  className="h-4 w-4 rounded border-edubot-line text-edubot-orange focus:ring-edubot-orange"
                />
                <label htmlFor="sendInvite" className="ml-2 text-sm text-edubot-ink">
                  Чакыруу жөнөтүү
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Жокко чыгаруу
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Сактоо...' : 'Сактоо'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
