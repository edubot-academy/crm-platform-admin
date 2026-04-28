import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import type { CreateTenantUserDto } from '../tenantUsersApi';

interface CreateUserModalProps {
  isOpen: boolean;
  form: CreateTenantUserDto;
  error: string;
  loading: boolean;
  onChange: (form: CreateTenantUserDto) => void;
  onSubmit: (e: React.FormEvent) => void;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Жаңы колдонуучу кошуу</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роль
              </label>
              <select
                value={form.role}
                onChange={(e) => onChange({ ...form, role: e.target.value as 'admin' | 'manager' | 'sales' | 'assistant' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="admin">Админ</option>
                <option value="manager">Менеджер</option>
                <option value="sales">Сатуу адиси</option>
                <option value="assistant">Ассистент</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={form.isActive ? 'active' : 'inactive'}
                onChange={(e) => onChange({ ...form, isActive: e.target.value === 'active' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Активдүү</option>
                <option value="inactive">Актив эмес</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendInvite"
                checked={form.sendInvite}
                onChange={(e) => onChange({ ...form, sendInvite: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">
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
  );
}
