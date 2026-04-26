import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Badge } from '../../shared/components/Badge';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { SkeletonCard } from '../../shared/components/SkeletonCard';
import { EmptyState } from '../../shared/components/EmptyState';
import { Plus, Edit, Power, PowerOff, Archive, CreditCard } from 'lucide-react';
import { plansApi, type Plan, type CreatePlanData, type PlanStatus } from './plansApi';

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<CreatePlanData>({
    name: '',
    code: '',
    description: '',
    monthlyPrice: undefined,
    yearlyPrice: undefined,
    currency: 'KGS',
    limits: {},
    features: {},
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await plansApi.getPlans();
      setPlans(data);
    } catch (err: any) {
      setError('Тарифтерди жүктөөдө ката кетти');
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Тарифтин аталышын киргизиңиз';
    if (!formData.code.trim()) return 'Кодду киргизиңиз';
    if (!/^[a-z0-9-]+$/.test(formData.code)) return 'Код төмөнкү регистрдеги латин ариптеринен, сандардан жана тиркемеден турушу керек';
    return null;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormLoading(true);

    try {
      await plansApi.createPlan(formData);
      toast.success('Тариф ийгиликтүү түзүлдү');
      setShowCreateForm(false);
      resetForm();
      loadPlans();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Тарифти түзүүдө ката кетти');
      toast.error(err.response?.data?.message || 'Тарифти түзүүдө ката кетти');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editingPlan) return;

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormLoading(true);

    try {
      await plansApi.updatePlan(editingPlan.id, formData);
      toast.success('Тариф ийгиликтүү жаңыртылды');
      setShowEditForm(false);
      setEditingPlan(null);
      resetForm();
      loadPlans();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Тарифти жаңыртууда ката кетти');
      toast.error(err.response?.data?.message || 'Тарифти жаңыртууда ката кетти');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (planId: string, newStatus: PlanStatus) => {
    setStatusLoading(planId);
    try {
      await plansApi.updatePlanStatus(planId, { status: newStatus });
      toast.success('Тарифтин статусу ийгиликтүү өзгөртүлдү');
      loadPlans();
    } catch (err: any) {
      console.error('Failed to update plan status:', err);
      toast.error(err.response?.data?.message || 'Статусту өзгөртүүдө ката кетти');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice || undefined,
      yearlyPrice: plan.yearlyPrice || undefined,
      currency: plan.currency,
      limits: plan.limits,
      features: plan.features,
      status: plan.status,
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      monthlyPrice: undefined,
      yearlyPrice: undefined,
      currency: 'KGS',
      limits: {},
      features: {},
      status: 'active',
    });
    setFormError('');
  };

  const getStatusBadge = (status: PlanStatus) => {
    const variant = status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'neutral';
    const label = status === 'active' ? 'Активдүү' : status === 'inactive' ? 'Өчүрүлгөн' : 'Архивделген';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleArchive = (plan: Plan) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Тарифти архивдөө',
      message: 'Бул тарифти архивдөөгө ишенесизби?',
      onConfirm: () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
        handleStatusChange(plan.id, 'archived');
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Тарифтер</h1>
        <Button onClick={() => { setShowCreateForm(!showCreateForm); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" />
          Жаңы тариф кошуу
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Жаңы тариф түзүү</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Тарифтин аталышы"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Starter"
              />
              <Input
                label="Код"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                required
                placeholder="starter"
              />
              <Input
                label="Сүрөттөмө"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Башталгыч план"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Айлык баа"
                  type="number"
                  value={formData.monthlyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="5000"
                />
                <Input
                  label="Жылдык баа"
                  type="number"
                  value={formData.yearlyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="50000"
                />
              </div>
              <Input
                label="Валюта"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="KGS"
              />
              <Input
                label="Лимиттер (JSON)"
                value={JSON.stringify(formData.limits, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, limits: JSON.parse(e.target.value) });
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"maxUsers": 5, "maxContacts": 1000}'
              />
              <Input
                label="Функциялар (JSON)"
                value={JSON.stringify(formData.features, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, features: JSON.parse(e.target.value) });
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"crm_enabled": true, "payments_enabled": true}'
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
                  onClick={() => { setShowCreateForm(false); resetForm(); }}
                  disabled={formLoading}
                >
                  Жокко чыгаруу
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Сактоо...' : 'Сактоо'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showEditForm && editingPlan && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Тарифти оңдоо</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                label="Тарифтин аталышы"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Код"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                required
              />
              <Input
                label="Сүрөттөмө"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Айлык баа"
                  type="number"
                  value={formData.monthlyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  label="Жылдык баа"
                  type="number"
                  value={formData.yearlyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <Input
                label="Валюта"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
              <Input
                label="Лимиттер (JSON)"
                value={JSON.stringify(formData.limits, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, limits: JSON.parse(e.target.value) });
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
              />
              <Input
                label="Функциялар (JSON)"
                value={JSON.stringify(formData.features, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, features: JSON.parse(e.target.value) });
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
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
                  onClick={() => { setShowEditForm(false); setEditingPlan(null); resetForm(); }}
                  disabled={formLoading}
                >
                  Жокко чыгаруу
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Сактоо...' : 'Сактоо'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Платформа тарифтери</h2>
          <p className="text-sm text-gray-500 mt-1">
            Тенанттар үчүн жеткиликтүү тариф пландары
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard showHeader lines={4} />
              <SkeletonCard showHeader lines={4} />
              <SkeletonCard showHeader lines={4} />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : plans.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Тарифтер табылган жок"
              description="Тариф пландары жок. Жаңы тариф түзүңүз."
              actionText="Жаңы тариф кошуу"
              onAction={() => setShowCreateForm(true)}
            />
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <Badge variant="neutral">{plan.code}</Badge>
                        {getStatusBadge(plan.status)}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {plan.monthlyPrice && (
                          <span>Айлык: {plan.monthlyPrice} {plan.currency}</span>
                        )}
                        {plan.yearlyPrice && (
                          <span>Жылдык: {plan.yearlyPrice} {plan.currency}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        title="Оңдоо"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {plan.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(plan.id, 'inactive')}
                          disabled={statusLoading === plan.id}
                          title="Өчүрүү"
                        >
                          <PowerOff className="w-4 h-4" />
                        </Button>
                      ) : plan.status === 'inactive' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(plan.id, 'active')}
                            disabled={statusLoading === plan.id}
                            title="Активдештирүү"
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(plan)}
                            disabled={statusLoading === plan.id}
                            title="Архивдөө"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {Object.keys(plan.features).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Функциялар:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(plan.features).map(([key, enabled]) => (
                          <Badge key={key} variant={enabled ? 'success' : 'neutral'}>
                            {key}: {enabled ? 'Активдүү' : 'Өчүрүлгөн'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(plan.limits).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Лимиттер:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(plan.limits).map(([key, value]) => (
                          <div key={key} className="text-gray-600">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
