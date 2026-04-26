import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Table } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Plus, Power, PowerOff } from 'lucide-react';
import { platformUsersApi, type PlatformUser, type CreatePlatformUserData } from './platformUsersApi';

export function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreatePlatformUserData>({
    fullName: '',
    email: '',
    password: '',
    role: 'superadmin',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformUsersApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError('Платформа колдонуучуларын жүктөөдө ката кетти');
      console.error('Failed to load platform users:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return 'Аты-жөнүнү киргизиңиз';
    if (!formData.email.trim()) return 'Email даректин киргизиңиз';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Туура email дарек киргизиңиз';
    // Password is optional (for invite flow)
    return null;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormLoading(true);

    try {
      await platformUsersApi.createUser(formData);
      toast.success('Колдонуучу ийгиликтүү түзүлдү');
      setShowCreateForm(false);
      setFormData({ fullName: '', email: '', password: '', role: 'superadmin' });
      loadUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Колдонуучуну түзүүдө ката кетти');
      toast.error(err.response?.data?.message || 'Колдонуучуну түзүүдө ката кетти');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: newStatus ? 'Колдонуучуну активдештирүү' : 'Колдонуучуну өчүрүү',
      message: newStatus
        ? 'Бул колдонуучуну активдештирүүгө ишенесизби?'
        : 'Бул колдонуучуну өчүрүүгө ишенесизби?',
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
        try {
          await platformUsersApi.updateUserStatus(userId, { isActive: newStatus });
          toast.success(newStatus ? 'Колдонуучу активдештирилди' : 'Колдонуучу өчүрүлдү');
          loadUsers();
        } catch (error) {
          console.error('Failed to update user status:', error);
          toast.error('Статусту өзгөртүүдө ката кетти');
        }
      },
    });
  };

  const columns = [
    { key: 'fullName', header: 'Аты-жөнү' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Роль',
      render: (value: string) => {
        if (value === 'superadmin') {
          return <Badge variant="success">Суперадмин</Badge>;
        }
        return <Badge variant="neutral">{value}</Badge>;
      },
    },
    {
      key: 'isActive',
      header: 'Статус',
      render: (value: boolean) => {
        const variant = value ? 'success' : 'neutral';
        const label = value ? 'Активдүү' : 'Өчүрүлгөн';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Түзүлгөн күнү',
      render: (value: string) => new Date(value).toLocaleDateString('ky-KG'),
    },
    {
      key: 'actions',
      header: 'Аракеттер',
      render: (_: any, row: PlatformUser) => (
        <div className="flex gap-2">
          {!row.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(row.id, true)}
              title="Активдештирүү"
            >
              <Power className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(row.id, false)}
              title="Өчүрүү"
            >
              <PowerOff className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Платформа колдонуучулары</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Жаңы колдонуучу
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Жаңы суперадмин түзүү</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                label="Аты-жөнү"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Иван Иванов"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="admin@edubot.it.com"
              />
              <Input
                label="Пароль"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Милдеттүү эмес (чакыруу агымы үчүн)"
              />
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormError('');
                    setFormData({ fullName: '', email: '', password: '', role: 'superadmin' });
                  }}
                  disabled={formLoading}
                >
                  Жокко чыгаруу
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Түзүү...' : 'Түзүү'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Платформа колдонуучулары табылган жок</div>
          ) : (
            <Table columns={columns} data={users} />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } })}
      />
    </div>
  );
}
