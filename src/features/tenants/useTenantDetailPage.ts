import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { plansApi, type Plan } from '../plans/plansApi';
import { tenantApi, type Tenant, type UpdateTenantData } from './tenantApi';
import { tenantDomainsApi, type CreateTenantDomainDto, type TenantDomain } from './tenantDomainsApi';
import { tenantSettingsApi, type TenantConfig, type UpdateTenantConfigDto } from './tenantSettingsApi';
import { tenantUsersApi, type CreateTenantUserDto, type GetTenantUsersParams, type TenantUserSummary } from './tenantUsersApi';

function getErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) ? error.response?.data?.message || fallback : fallback;
}

export function useTenantDetailPage(tenantId?: string) {
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
    isActive: true,
    sendInvite: true,
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const enabledModuleKeys = settings?.enabledModules
    ? Object.entries(settings.enabledModules)
      .filter(([, enabled]) => enabled)
      .map(([module]) => module)
    : [];

  const loadTenant = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    try {
      const data = await tenantApi.getTenantById(tenantId);
      setTenant(data);
      setEditForm({
        name: data.name,
        slug: data.slug,
        primaryEmail: undefined,
      });
      setSelectedPlanId(data.plan?.id || '');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Тенантты жүктөөдө ката кетти'));
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const data = await plansApi.getPlans();
      setPlans(data.filter((plan) => plan.status === 'active'));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Тарифтерди жүктөөдө ката кетти'));
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const loadDomains = useCallback(async () => {
    if (!tenantId) return;
    setDomainsLoading(true);
    setError('');
    try {
      const data = await tenantDomainsApi.getTenantDomains(tenantId);
      setDomains(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Домендерди жүктөөдө ката кетти'));
    } finally {
      setDomainsLoading(false);
    }
  }, [tenantId]);

  const loadUsers = useCallback(async (params: GetTenantUsersParams = {}) => {
    if (!tenantId) return;
    setUsersLoading(true);
    setError('');
    try {
      const data = await tenantUsersApi.getTenantUsers(tenantId, params);
      setUsers(data.items);
      setUsersPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Колдонуучуларды жүктөөдө ката кетти'));
    } finally {
      setUsersLoading(false);
    }
  }, [tenantId]);

  const loadSettings = useCallback(async () => {
    if (!tenantId) return;
    setSettingsLoading(true);
    setError('');
    try {
      const data = await tenantSettingsApi.getTenantSettings(tenantId);
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Жөндөөлөрдү жүктөөдө ката кетти'));
    } finally {
      setSettingsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return undefined;
    const timeoutId = window.setTimeout(() => {
      void loadTenant();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [tenantId, loadTenant]);

  useEffect(() => {
    if (activeTab !== 'plan') return undefined;
    const timeoutId = window.setTimeout(() => {
      void loadPlans();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, loadPlans]);

  useEffect(() => {
    if (activeTab !== 'domains') return undefined;
    const timeoutId = window.setTimeout(() => {
      void loadDomains();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, loadDomains]);

  useEffect(() => {
    if (activeTab !== 'users') return undefined;
    const timeoutId = window.setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab !== 'settings') return undefined;
    const timeoutId = window.setTimeout(() => {
      void loadSettings();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, loadSettings]);

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await tenantApi.updateTenant(tenantId, editForm);
      setSuccess('Тенант маалыматтары ийгиликтүү жаңыртылды');
      setIsEditing(false);
      await loadTenant();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Жаңыртууда ката кетти'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Tenant['status']) => {
    if (!tenantId) return;
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
          await tenantApi.updateTenantStatus(tenantId, newStatus);
          setSuccess('Статус ийгиликтүү өзгөртүлдү');
          toast.success('Статус ийгиликтүү өзгөртүлдү');
          await loadTenant();
        } catch (err: unknown) {
          const errorMessage = getErrorMessage(err, 'Статусту өзгөртүүдө ката кетти');
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setStatusLoading(false);
        }
      },
    });
  };

  const handlePlanAssign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId) return;
    if (!selectedPlanId) {
      setError('Тарифти тандап коюңуз');
      return;
    }
    setPlanAssignLoading(true);
    setError('');
    setSuccess('');
    try {
      await plansApi.assignTenantPlan(tenantId, { planId: selectedPlanId });
      setSuccess('Тариф ийгиликтүү белгиленди');
      toast.success('Тариф ийгиликтүү белгиленди');
      await loadTenant();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Тарифти белгилөөдө ката кетти');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPlanAssignLoading(false);
    }
  };

  const handleCreateDomain = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId) return;
    if (!createDomainForm.domain) {
      setError('Доменди киргизиңиз');
      return;
    }
    setDomainActionLoading('create');
    setError('');
    setSuccess('');
    try {
      await tenantDomainsApi.createTenantDomain(tenantId, createDomainForm);
      setSuccess('Домен ийгиликтүү түзүлдү');
      toast.success('Домен ийгиликтүү түзүлдү');
      setShowCreateDomainModal(false);
      setCreateDomainForm({ domain: '', type: 'default' });
      await loadDomains();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Доменди түзүүдө ката кетти');
      setError(errorMessage);
      toast.error(errorMessage);
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
      await loadDomains();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Негизги доменди өзгөртүүдө ката кетти');
      setError(errorMessage);
      toast.error(errorMessage);
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
      await loadDomains();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Домен статусун өзгөртүүдө ката кетти');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDomainActionLoading(null);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: boolean) => {
    if (!tenantId) return;
    setUserActionLoading(userId);
    setError('');
    setSuccess('');
    try {
      await tenantUsersApi.updateTenantUserStatus(tenantId, userId, { isActive: newStatus });
      setSuccess('Колдонуучу статусу ийгиликтүү өзгөртүлдү');
      toast.success('Колдонуучу статусу ийгиликтүү өзгөртүлдү');
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
      await loadUsers({ page: usersPagination.page, limit: usersPagination.limit });
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Колдонуучу статусун өзгөртүүдө ката кетти');
      setError(errorMessage);
      toast.error(errorMessage);
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleResendInvite = async (userId: string) => {
    if (!tenantId) return;
    setUserActionLoading(userId);
    setError('');
    setSuccess('');
    try {
      const result = await tenantUsersApi.resendInvite(tenantId, userId);
      setInviteLink(result.inviteLink);
      setShowInviteLink(true);
      setSuccess('Чакыруу шилтемеси ийгиликтүү жаңыртылды');
      toast.success('Чакыруу шилтемеси ийгиликтүү жаңыртылды');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Чакыруу шилтемесин жаңыртууда ката кетти');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Шилтеме көчүрүлдү');
    }
  };

  const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId) return;
    setCreateUserError('');
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
      const result = await tenantUsersApi.createTenantUser(tenantId, createUserForm);
      setSuccess('Колдонуучу ийгиликтүү кошулду');
      toast.success('Колдонуучу ийгиликтүү кошулду');
      if (result.inviteLink) {
        setInviteLink(result.inviteLink);
        setShowInviteLink(true);
      }
      setShowCreateUserModal(false);
      setCreateUserForm({
        name: '',
        email: '',
        role: 'admin',
        isActive: true,
        sendInvite: true,
      });
      await loadUsers({ page: usersPagination.page, limit: usersPagination.limit });
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Колдонуучу кошууда ката кетти');
      setCreateUserError(errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId) return;
    setError('');
    setSuccess('');
    setSettingsSaving(true);
    try {
      await tenantSettingsApi.updateTenantSettings(tenantId, settingsForm);
      setSuccess('Жөндөөлөр ийгиликтүү жаңыртылды');
      toast.success('Жөндөөлөр ийгиликтүү жаңыртылды');
      await loadSettings();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Жөндөөлөрдү жаңыртууда ката кетти');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSettingsSaving(false);
    }
  };

  return {
    tenant,
    plans,
    domains,
    users,
    usersPagination,
    settings,
    settingsForm,
    settingsLoading,
    settingsSaving,
    loading,
    plansLoading,
    domainsLoading,
    usersLoading,
    error,
    success,
    activeTab,
    isEditing,
    editForm,
    selectedPlanId,
    statusLoading,
    planAssignLoading,
    showCreateDomainModal,
    createDomainForm,
    domainActionLoading,
    userActionLoading,
    showCreateUserModal,
    createUserForm,
    createUserLoading,
    createUserError,
    inviteLink,
    showInviteLink,
    confirmDialog,
    enabledModuleKeys,
    setSettingsForm,
    setActiveTab,
    setIsEditing,
    setEditForm,
    setSelectedPlanId,
    setShowCreateDomainModal,
    setCreateDomainForm,
    setShowCreateUserModal,
    setCreateUserForm,
    setShowInviteLink,
    setConfirmDialog,
    setCreateUserError,
    handleEditSubmit,
    handleStatusChange,
    handlePlanAssign,
    handleCreateDomain,
    handleSetPrimary,
    handleUpdateDomainStatus,
    handleUpdateUserStatus,
    handleResendInvite,
    handleCopyInviteLink,
    handleCreateUser,
    handleSettingsSubmit,
    loadUsers,
  };
}
