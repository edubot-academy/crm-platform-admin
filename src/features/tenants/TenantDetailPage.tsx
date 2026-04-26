import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Badge } from '../../shared/components/Badge';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { ArrowLeft, Globe, CreditCard, Users, Settings, FileText } from 'lucide-react';
import { tenantApi, type Tenant, type UpdateTenantData } from './tenantApi';
import { tenantDomainsApi, type TenantDomain, type CreateTenantDomainDto } from './tenantDomainsApi';
import { tenantUsersApi, type TenantUserSummary, type GetTenantUsersParams, type CreateTenantUserDto } from './tenantUsersApi';
import { tenantSettingsApi, type TenantConfig, type UpdateTenantConfigDto } from './tenantSettingsApi';
import { plansApi, type Plan } from '../plans/plansApi';
import { SkeletonCard } from '../../shared/components/SkeletonCard';
import { EmptyState } from '../../shared/components/EmptyState';

export function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [users, setUsers] = useState<TenantUserSummary[]>([]);
  const [usersPagination, setUsersPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [settings, setSettings] = useState<TenantConfig | null>(null);
  const [settingsForm, setSettingsForm] = useState<UpdateTenantConfigDto>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTenantData>({});
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [planAssignLoading, setPlanAssignLoading] = useState(false);
  const [showCreateDomainModal, setShowCreateDomainModal] = useState(false);
  const [createDomainForm, setCreateDomainForm] = useState<CreateTenantDomainDto>({ domain: '', type: 'default' });
  const [domainActionLoading, setDomainActionLoading] = useState<string | null>(null);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState<CreateTenantUserDto>({
    name: '',
    email: '',
    role: 'admin',
    status: 'active',
    sendInvite: true,
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const loadTenant = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tenantApi.getTenantById(tenantId!);
      setTenant(data);
      setEditForm({
        name: data.name,
        slug: data.slug,
        primaryEmail: data.primaryEmail || undefined,
        planId: data.planId || undefined,
      });
      setSelectedPlanId(data.planId || '');
    } catch (err: any) {
      setError('Тенантты жүктөөдө ката кетти');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const data = await plansApi.getPlans();
      setPlans(data.filter(p => p.status === 'active'));
    } catch (err: any) {
    } finally {
      setPlansLoading(false);
    }
  };

  const loadDomains = async () => {
    setDomainsLoading(true);
    setError('');
    try {
      const data = await tenantDomainsApi.getTenantDomains(tenantId!);
      setDomains(data);
    } catch (err: any) {
      setError('Домендерди жүктөөдө ката кетти');
    } finally {
      setDomainsLoading(false);
    }
  };

  const loadUsers = async (params: GetTenantUsersParams = {}) => {
    setUsersLoading(true);
    setError('');
    try {
      const data = await tenantUsersApi.getTenantUsers(tenantId!, params);
      setUsers(data.items);
      setUsersPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err: any) {
      setError('Колдонуучуларды жүктөөдө ката кетти');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    setError('');
    try {
      const data = await tenantSettingsApi.getTenantSettings(tenantId!);
      setSettings(data);
      setSettingsForm({
        defaultLanguage: data.defaultLanguage,
        timezone: data.timezone,
        currency: data.currency,
        supportEmail: data.supportEmail,
        metadata: {
          platformNotes: data.metadata?.platformNotes || '',
        },
      });
    } catch (err: any) {
      setError('Жөндөөлөрдү жүктөөдө ката кетти');
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  useEffect(() => {
    if (activeTab === 'plan') {
      loadPlans();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'domains') {
      loadDomains();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await tenantApi.updateTenant(tenantId!, editForm);
      setSuccess('Тенант маалыматтары ийгиликтүү жаңыртылды');
      setIsEditing(false);
      loadTenant();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Жаңыртууда ката кетти');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'suspended' | 'archived') => {
    setConfirmDialog({
      isOpen: true,
      title: 'Статусту өзгөртүү',
      message: `Статусту өзгөртүүгө ишенесизби: ${newStatus}?`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
        setStatusLoading(true);
        setError('');
        setSuccess('');

        try {
          await tenantApi.updateTenantStatus(tenantId!, newStatus);
          setSuccess('Статус ийгиликтүү өзгөртүлдү');
          toast.success('Статус ийгиликтүү өзгөртүлдү');
          loadTenant();
        } catch (err: any) {
          setError(err.response?.data?.message || 'Статусту өзгөртүүдө ката кетти');
          toast.error(err.response?.data?.message || 'Статусту өзгөртүүдө ката кетти');
        } finally {
          setStatusLoading(false);
        }
      },
    });
  };

  const handlePlanAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError('Тарифти тандап коюңуз');
      return;
    }

    setPlanAssignLoading(true);
    setError('');
    setSuccess('');

    try {
      await plansApi.assignTenantPlan(tenantId!, { planId: selectedPlanId });
      setSuccess('Тариф ийгиликтүү белгилendi');
      toast.success('Тариф ийгиликтүү белгилendi');
      loadTenant();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Тарифти белгилөөдө ката кетти');
      toast.error(err.response?.data?.message || 'Тарифти белгилөөдө ката кетти');
    } finally {
      setPlanAssignLoading(false);
    }
  };

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createDomainForm.domain) {
      setError('Доменди киргизиңиз');
      return;
    }

    setDomainActionLoading('create');
    setError('');
    setSuccess('');

    try {
      await tenantDomainsApi.createTenantDomain(tenantId!, createDomainForm);
      setSuccess('Домен ийгиликтүү түзүлдү');
      toast.success('Домен ийгиликтүү түзүлдү');
      setShowCreateDomainModal(false);
      setCreateDomainForm({ domain: '', type: 'default' });
      loadDomains();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Доменди түзүүдө ката кетти');
      toast.error(err.response?.data?.message || 'Доменди түзүүдө ката кетти');
    } finally {
      setDomainActionLoading(null);
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    setDomainActionLoading(domainId);
    setError('');
    setSuccess('');

    try {
      await tenantDomainsApi.setDomainPrimary(domainId, true);
      setSuccess('Негизги домен ийгиликтүү өзгөртүлдү');
      toast.success('Негизги домен ийгиликтүү өзгөртүлдү');
      loadDomains();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Негизги доменди өзгөртүүдө ката кетти');
      toast.error(err.response?.data?.message || 'Негизги доменди өзгөртүүдө ката кетти');
    } finally {
      setDomainActionLoading(null);
    }
  };

  const handleUpdateDomainStatus = async (domainId: string, newStatus: 'active' | 'pending' | 'failed' | 'disabled') => {
    setDomainActionLoading(domainId);
    setError('');
    setSuccess('');

    try {
      await tenantDomainsApi.updateDomainStatus(domainId, { status: newStatus });
      setSuccess('Домен статусу ийгиликтүү өзгөртүлдү');
      toast.success('Домен статусу ийгиликтүү өзгөртүлдү');
      loadDomains();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Домен статусун өзгөртүүдө ката кетти');
      toast.error(err.response?.data?.message || 'Домен статусун өзгөртүүдө ката кетти');
    } finally {
      setDomainActionLoading(null);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended' | boolean) => {
    setUserActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      // Convert string status to boolean to match backend format
      const statusValue = newStatus === 'active' ? true : false;
      await tenantUsersApi.updateTenantUserStatus(tenantId!, userId, { status: statusValue });
      setSuccess('Колдонуучу статусу ийгиликтүү өзгөртүлдү');
      toast.success('Колдонуучу статусу ийгиликтүү өзгөртүлдү');
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Колдонуучу статусун өзгөртүүдө ката кетти');
      toast.error(err.response?.data?.message || 'Колдонуучу статусун өзгөртүүдө ката кетти');
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError('');

    // Validation
    if (!createUserForm.name.trim()) {
      setCreateUserError('Аты-жөнүн жазыңыз');
      return;
    }
    if (!createUserForm.email.trim()) {
      setCreateUserError('Email жазыңыз');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserForm.email)) {
      setCreateUserError('Email туура эмес');
      return;
    }
    if (!createUserForm.role) {
      setCreateUserError('Роль тандаңыз');
      return;
    }

    setCreateUserLoading(true);
    setError('');
    setSuccess('');

    try {
      await tenantUsersApi.createTenantUser(tenantId!, createUserForm);
      setSuccess('Колдонуучу ийгиликтүү кошулду');
      toast.success('Колдонуучу ийгиликтүү кошулду');
      setShowCreateUserModal(false);
      setCreateUserForm({
        name: '',
        email: '',
        role: 'admin',
        status: 'active',
        sendInvite: true,
      });
      loadUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Колдонуучу кошууда ката кетти';
      setCreateUserError(errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSettingsSaving(true);

    try {
      await tenantSettingsApi.updateTenantSettings(tenantId!, settingsForm);
      setSuccess('Жөндөөлөр ийгиликтүү жаңыртылды');
      toast.success('Жөндөөлөр ийгиликтүү жаңыртылды');
      loadSettings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Жөндөөлөрдү жаңыртууда ката кетти');
      toast.error(err.response?.data?.message || 'Жөндөөлөрдү жаңыртууда ката кетти');
    } finally {
      setSettingsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'success' : status === 'suspended' ? 'danger' : status === 'archived' ? 'neutral' : 'warning';
    const label = status === 'active' ? 'Активдүү' : status === 'suspended' ? 'Токтотулган' : status === 'archived' ? 'Архивделген' : 'Актив эмес';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getDomainStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'success' : status === 'pending' ? 'warning' : status === 'failed' ? 'danger' : 'neutral';
    const label = status === 'active' ? 'Активдүү' : status === 'pending' ? 'Күтүүдө' : status === 'failed' ? 'Иштебей калган' : 'Өчүрүлгөн';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getDomainTypeBadge = (type: string) => {
    const variant = type === 'default' ? 'neutral' : 'info';
    const label = type === 'default' ? 'Жарыяланган' : 'Кастом';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getUserStatusBadge = (status: string | boolean) => {
    const isActive = status === true || status === 'active';
    const variant = isActive ? 'success' : 'warning';
    const label = isActive ? 'Активдүү' : 'Актив эмес';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getUserRoleBadge = (role: string) => {
    const variant = role === 'admin' ? 'success' : role === 'manager' ? 'info' : role === 'sales' ? 'warning' : 'neutral';
    const label = role === 'admin' ? 'Админ' : role === 'manager' ? 'Менеджер' : role === 'sales' ? 'Сатуу адиси' : 'Ассистент';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const tabs = [
    { id: 'overview', label: 'Жалпы маалымат', icon: Globe },
    { id: 'domains', label: 'Домендер', icon: Globe },
    { id: 'plan', label: 'Тариф жана функциялар', icon: CreditCard },
    { id: 'users', label: 'Колдонуучулар', icon: Users },
    { id: 'settings', label: 'Жөндөөлөр', icon: Settings },
    { id: 'audit', label: 'Аудит', icon: FileText },
  ];

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>;
  }

  if (!tenant) {
    return <div className="text-center py-8 text-gray-500">Тенант табылган жок</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/platform/tenants">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Артка
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-sm text-gray-500">{tenant.slug}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Жокко чыгаруу' : 'Оңдоо'}
        </Button>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                aria-label={tab.label}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isEditing ? (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Тенантты оңдоо</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <Input
                    label="Компаниянын аталышы"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Слаг"
                    value={editForm.slug || ''}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase() })}
                    required
                  />
                  <Input
                    label="Негизги email"
                    type="email"
                    value={editForm.primaryEmail || ''}
                    onChange={(e) => setEditForm({ ...editForm, primaryEmail: e.target.value })}
                  />
                  <Input
                    label="Тариф ID"
                    value={editForm.planId || ''}
                    onChange={(e) => setEditForm({ ...editForm, planId: e.target.value })}
                    required
                  />
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={loading}>
                      Жокко чыгаруу
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Сактоо...' : 'Сактоо'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Жалпы маалымат</h2>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Компания</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Слаг</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.slug}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Негизги домен</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.domain || 'Жок'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Негизги email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.primaryEmail || 'Жок'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Статус</dt>
                      <dd className="mt-1">
                        {getStatusBadge(tenant.status)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Түзүлгөн күнү</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(tenant.createdAt).toLocaleDateString('ky-KG')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Жаңыртылган күнү</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(tenant.updatedAt).toLocaleDateString('ky-KG')}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Тариф маалыматы</h2>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Азыркы тариф ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.planId || 'Жок'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Статусту өзгөртүү</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={tenant.status === 'active' ? 'primary' : 'secondary'}
                      onClick={() => handleStatusChange('active')}
                      disabled={statusLoading}
                    >
                      Активдүү
                    </Button>
                    <Button
                      variant={tenant.status === 'inactive' ? 'primary' : 'secondary'}
                      onClick={() => handleStatusChange('inactive')}
                      disabled={statusLoading}
                    >
                      Актив эмес
                    </Button>
                    <Button
                      variant={tenant.status === 'suspended' ? 'primary' : 'secondary'}
                      onClick={() => handleStatusChange('suspended')}
                      disabled={statusLoading}
                    >
                      Токтотулган
                    </Button>
                    <Button
                      variant={tenant.status === 'archived' ? 'primary' : 'secondary'}
                      onClick={() => handleStatusChange('archived')}
                      disabled={statusLoading}
                    >
                      Архивделген
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Азыркы тариф</h2>
            </CardHeader>
            <CardContent>
              {tenant?.planId ? (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Тариф ID:</span> {tenant.planId}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Тариф белгиленген эмес</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Тарифти өзгөртүү</h2>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>
              ) : plans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Активдүү тарифтер жок</div>
              ) : (
                <form onSubmit={handlePlanAssign} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Жаңы тариф
                    </label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Тарифти танданыз</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({plan.code}) - {plan.monthlyPrice || plan.yearlyPrice ? `${plan.monthlyPrice || plan.yearlyPrice} ${plan.currency}` : 'Баасы жок'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={planAssignLoading || !selectedPlanId}>
                      {planAssignLoading ? 'Сактоо...' : 'Сактоо'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'domains' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Тенант домендери</h2>
                <Button onClick={() => setShowCreateDomainModal(true)}>
                  Домен кошуу
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {domainsLoading ? (
                <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>
              ) : domains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Домендер жок</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Домен</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Түрү</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Негизги</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Текшерилген</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Түзүлгөн күнү</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Аракеттер</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {domains.map((domain) => (
                        <tr key={domain.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{domain.domain}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getDomainTypeBadge(domain.type)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getDomainStatusBadge(domain.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {domain.isPrimary ? (
                              <Badge variant="success">Негизги</Badge>
                            ) : (
                              <span className="text-sm text-gray-500">Жок</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {domain.isVerified ? (
                              <Badge variant="success">Текшерилген</Badge>
                            ) : (
                              <span className="text-sm text-gray-500">Текшерилбеген</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(domain.createdAt).toLocaleDateString('ky-KG')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {!domain.isPrimary && domain.status === 'active' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleSetPrimary(domain.id.toString())}
                                  disabled={domainActionLoading === domain.id.toString()}
                                >
                                  {domainActionLoading === domain.id.toString() ? 'Күтүүдө...' : 'Негизги кылуу'}
                                </Button>
                              )}
                              {domain.status === 'active' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleUpdateDomainStatus(domain.id.toString(), 'disabled')}
                                  disabled={domainActionLoading === domain.id.toString()}
                                >
                                  {domainActionLoading === domain.id.toString() ? 'Күтүүдө...' : 'Өчүрүү'}
                                </Button>
                              )}
                              {domain.status === 'disabled' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleUpdateDomainStatus(domain.id.toString(), 'active')}
                                  disabled={domainActionLoading === domain.id.toString()}
                                >
                                  {domainActionLoading === domain.id.toString() ? 'Күтүүдө...' : 'Активдештирүү'}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Тенант колдонуучулары</h2>
                <Button onClick={() => setShowCreateUserModal(true)}>
                  Жаңы колдонуучу кошуу
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Колдонуучулар жок</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Аты-жөнү</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Акыркы кирүү</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Түзүлгөн күнү</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Аракеттер</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getUserRoleBadge(user.role)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getUserStatusBadge(user.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ky-KG') : 'Кирген эмес'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString('ky-KG')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {(user.status === true || user.status === 'active') && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setConfirmDialog({
                                        isOpen: true,
                                        title: 'Колдонуучуну өчүрүү',
                                        message: `${user.name} колдонуучусун өчүрүүгө ишенесизби?`,
                                        onConfirm: () => handleUpdateUserStatus(user.id.toString(), 'inactive'),
                                      });
                                    }}
                                    disabled={userActionLoading === user.id.toString()}
                                  >
                                    {userActionLoading === user.id.toString() ? 'Күтүүдө...' : 'Өчүрүү'}
                                  </Button>
                                )}
                                {(user.status === false || user.status === 'inactive' || user.status === 'suspended') && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setConfirmDialog({
                                        isOpen: true,
                                        title: 'Колдонуучуну активдештирүү',
                                        message: `${user.name} колдонуучусун активдештирүүгө ишенесизби?`,
                                        onConfirm: () => handleUpdateUserStatus(user.id.toString(), 'active'),
                                      });
                                    }}
                                    disabled={userActionLoading === user.id.toString()}
                                  >
                                    {userActionLoading === user.id.toString() ? 'Күтүүдө...' : 'Активдештирүү'}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {usersPagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {usersPagination.total} колдонуучу, {usersPagination.page} барак / {usersPagination.totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => loadUsers({ page: usersPagination.page - 1, limit: usersPagination.limit })}
                          disabled={usersPagination.page === 1 || usersLoading}
                        >
                          Мурунку
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => loadUsers({ page: usersPagination.page + 1, limit: usersPagination.limit })}
                          disabled={usersPagination.page === usersPagination.totalPages || usersLoading}
                        >
                          Кийинки
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Платформа жөндөөлөрү</h2>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <SkeletonCard showHeader lines={4} />
              ) : settings ? (
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Демейки тил"
                      value={settingsForm.defaultLanguage || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, defaultLanguage: e.target.value })}
                      placeholder="ky"
                    />
                    <Input
                      label="Убакыт алкагы"
                      value={settingsForm.timezone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                      placeholder="Asia/Bishkek"
                    />
                    <Input
                      label="Валюта"
                      value={settingsForm.currency || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                      placeholder="KGS"
                    />
                    <Input
                      label="Колдоо email"
                      type="email"
                      value={settingsForm.supportEmail || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      placeholder="support@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Платформа эскертмеси
                    </label>
                    <textarea
                      value={settingsForm.metadata?.platformNotes || ''}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        metadata: { ...settingsForm.metadata, platformNotes: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Платформа админдары үчүн эскертмелер..."
                    />
                  </div>

                  {/* Read-only enabled modules */}
                  <div className="border-t pt-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">Модулдар</h3>
                    {settings.enabledModules && settings.enabledModules.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {settings.enabledModules.map((module) => (
                          <Badge key={module} variant="success">
                            {module}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Модулдар жок</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={settingsSaving}>
                      {settingsSaving ? 'Сактоо...' : 'Сактоо'}
                    </Button>
                  </div>
                </form>
              ) : (
                <EmptyState icon={Settings} title="Жөндөөлөр табылган жок" description="Жөндөөлөр жок." />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab !== 'overview' && activeTab !== 'plan' && activeTab !== 'domains' && activeTab !== 'users' && activeTab !== 'settings' && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Бул бөлүк азырынча иштелип чыккан жок
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } })}
      />

      {/* Create Domain Modal */}
      {showCreateDomainModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Жаңы домен кошуу</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDomain} className="space-y-4">
                <Input
                  label="Домен"
                  value={createDomainForm.domain}
                  onChange={(e) => setCreateDomainForm({ ...createDomainForm, domain: e.target.value })}
                  placeholder="example.com"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Түрү
                  </label>
                  <select
                    value={createDomainForm.type}
                    onChange={(e) => setCreateDomainForm({ ...createDomainForm, type: e.target.value as 'default' | 'custom' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="default">Жарыяланган</option>
                    <option value="custom">Кастом</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateDomainModal(false);
                      setCreateDomainForm({ domain: '', type: 'default' });
                    }}
                    disabled={domainActionLoading === 'create'}
                  >
                    Жокко чыгаруу
                  </Button>
                  <Button type="submit" disabled={domainActionLoading === 'create'}>
                    {domainActionLoading === 'create' ? 'Сактоо...' : 'Сактоо'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Жаңы колдонуучу кошуу</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {createUserError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {createUserError}
                  </div>
                )}
                <Input
                  label="Аты-жөнү"
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  placeholder="Иван Иванов"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль
                  </label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value as 'admin' | 'manager' | 'sales' | 'assistant' })}
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
                    value={createUserForm.status}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, status: e.target.value as 'active' | 'inactive' })}
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
                    checked={createUserForm.sendInvite}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, sendInvite: e.target.checked })}
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
                    onClick={() => {
                      setShowCreateUserModal(false);
                      setCreateUserForm({
                        name: '',
                        email: '',
                        role: 'admin',
                        status: 'active',
                        sendInvite: true,
                      });
                      setCreateUserError('');
                    }}
                    disabled={createUserLoading}
                  >
                    Жокко чыгаруу
                  </Button>
                  <Button type="submit" disabled={createUserLoading}>
                    {createUserLoading ? 'Сактоо...' : 'Сактоо'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
