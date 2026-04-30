import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Card, CardContent } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Table } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { FormModal } from '../../shared/components/FormModal';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import { Plus, Power, PowerOff, Users } from 'lucide-react';
import { platformUsersApi, type PlatformUser, type CreatePlatformUserData } from './platformUsersApi';
import { InviteLinkBanner } from '../tenants/components/InviteLinkBanner';

export function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreatePlatformUserData>({
    name: '',
    fullName: '',
    email: '',
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

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformUsersApi.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Платформа админдерин жүктөөдө ката кетти' : 'Платформа админдерин жүктөөдө ката кетти');
      console.error('Failed to load platform users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

  const validateForm = (): string | null => {
    if (!formData.fullName?.trim() && !formData.name?.trim()) return 'Аты-жөнүн киргизиңиз';
    if (!formData.email.trim()) return 'Email дарегин киргизиңиз';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Туура email дарегин киргизиңиз';
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
      const normalizedData = platformUsersApi.normalizeCreateData(formData);
      const result = await platformUsersApi.createUser(normalizedData);
      toast.success('Платформа админи ийгиликтүү түзүлдү');
      if (result.inviteLink) {
        setInviteLink(result.inviteLink);
        setShowInviteLink(true);
      }
      setShowCreateForm(false);
      setFormData({ name: '', fullName: '', email: '', role: 'superadmin' });
      void loadUsers();
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err) ? err.response?.data?.message || 'Платформа админин түзүүдө ката кетти' : 'Платформа админин түзүүдө ката кетти';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: newStatus ? 'Админди активдештирүү' : 'Админди өчүрүү',
      message: newStatus
        ? 'Бул админ үчүн платформага кирүү мүмкүнчүлүгүн кайра ачасызбы?'
        : 'Бул админ өчүрүлсө, платформага кире албай калат. Улантасызбы?',
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
        try {
          await platformUsersApi.updateUserStatus(userId, { isActive: newStatus });
          toast.success(newStatus ? 'Админ активдештирилди' : 'Админ өчүрүлдү');
          void loadUsers();
        } catch (error) {
          console.error('Failed to update user status:', error);
          toast.error('Статусту өзгөртүүдө ката кетти');
        }
      },
    });
  };

  const handleResendInvite = async (userId: number) => {
    setUserActionLoading(userId);
    try {
      const result = await platformUsersApi.resendInvite(userId);
      setInviteLink(result.inviteLink);
      setShowInviteLink(true);
      toast.success('Чакыруу ийгиликтүү кайра жөнөтүлдү');
    } catch (err: unknown) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || 'Чакырууну кайра жөнөтүүдө ката кетти' : 'Чакырууну кайра жөнөтүүдө ката кетти');
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Чакыруу шилтемеси көчүрүлдү');
    }
  };

  const columns = [
    {
      key: 'displayName',
      header: 'Аты-жөнү',
      render: (_value: unknown, row: PlatformUser) => platformUsersApi.getDisplayName(row),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Роль',
      render: (value: unknown) => {
        const role = value as string;
        if (role === 'superadmin') {
          return <Badge variant="success">Суперадмин</Badge>;
        }
        return <Badge variant="neutral">{role}</Badge>;
      },
    },
    {
      key: 'isActive',
      header: 'Статус',
      render: (value: unknown) => {
        const isActive = value as boolean;
        const variant = isActive ? 'success' : 'neutral';
        const label = isActive ? 'Активдүү' : 'Өчүрүлгөн';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Түзүлгөн күнү',
      render: (value: unknown) => new Date(value as string).toLocaleDateString('ky-KG'),
    },
    {
      key: 'actions',
      header: 'Аракеттер',
      render: (_value: unknown, row: PlatformUser) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleResendInvite(row.id)}
            disabled={userActionLoading === row.id}
          >
            {userActionLoading === row.id ? 'Күтүлүүдө...' : 'Чакыруу жөнөтүү'}
          </Button>
          {!row.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(row.id, true)}
              title="Активдештирүү"
              aria-label="Админди активдештирүү"
            >
              <Power className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(row.id, false)}
              title="Өчүрүү"
              aria-label="Админди өчүрүү"
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
      <PageHeader
        title="Платформа админдери"
        description="Суперадминдерди түзүңүз, чакырууларды кайра жөнөтүңүз жана платформага кирүү мүмкүнчүлүгүн борбордон башкарыңыз."
        actions={(
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Жаңы админ
          </Button>
        )}
      />

      {showInviteLink && inviteLink && (
        <InviteLinkBanner
          inviteLink={inviteLink}
          onCopy={handleCopyInviteLink}
          onClose={() => setShowInviteLink(false)}
        />
      )}

      <FormModal
        isOpen={showCreateForm}
        title="Жаңы суперадмин түзүү"
        description="Платформага жаңы суперадмин кошуп, чакыруу аркылуу жеткиликтүүлүк бериңиз."
        maxWidthClassName="max-w-xl"
        onClose={() => {
          setShowCreateForm(false);
          setFormError('');
          setFormData({ name: '', fullName: '', email: '', role: 'superadmin' });
        }}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Аты-жөнү"
            value={formData.fullName || formData.name || ''}
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
          {formError && <Alert variant="error">{formError}</Alert>}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateForm(false);
                setFormError('');
                setFormData({ name: '', fullName: '', email: '', role: 'superadmin' });
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
      </FormModal>

      <Card className="app-surface">
        <CardContent className="p-6">
          {loading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Платформа админдери табылган жок"
              description="Платформада админдер жок. Жаңы суперадмин түзүңүз."
              actionText="Жаңы админ"
              onAction={() => setShowCreateForm(true)}
            />
          ) : (
            <Table columns={columns} data={users} rowKey="id" />
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
