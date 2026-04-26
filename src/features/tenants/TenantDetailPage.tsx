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
import { plansApi, type Plan } from '../plans/plansApi';

export function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTenantData>({});
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [planAssignLoading, setPlanAssignLoading] = useState(false);
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
      console.error('Failed to load tenant:', err);
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
      console.error('Failed to load plans:', err);
    } finally {
      setPlansLoading(false);
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

  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'success' : status === 'suspended' ? 'danger' : status === 'archived' ? 'neutral' : 'warning';
    const label = status === 'active' ? 'Активдүү' : status === 'suspended' ? 'Токтотулган' : status === 'archived' ? 'Архивделген' : 'Актив эмес';
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

      {activeTab !== 'overview' && activeTab !== 'plan' && (
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
    </div>
  );
}
