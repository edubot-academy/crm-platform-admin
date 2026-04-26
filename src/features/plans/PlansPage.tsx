import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Badge } from '../../shared/components/Badge';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { SkeletonCard } from '../../shared/components/SkeletonCard';
import { EmptyState } from '../../shared/components/EmptyState';
import { Plus, Edit, Power, PowerOff, Archive, CreditCard, Check, X } from 'lucide-react';
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

  // Available features for visual editor
  const availableFeatures = [
    { key: 'crm_enabled', label: 'CRM модулу' },
    { key: 'payments_enabled', label: 'Төлөмдөр' },
    { key: 'trial_lessons_enabled', label: 'Сыноо сабактар' },
    { key: 'retention_enabled', label: 'Студентти кармап калуу' },
    { key: 'telegram_notifications_enabled', label: 'Telegram билдирүүлөр' },
    { key: 'whatsapp_integration_enabled', label: 'WhatsApp интеграциясы' },
    { key: 'advanced_reports_enabled', label: 'Кеңейтилген отчеттор' },
    { key: 'lms_bridge_enabled', label: 'LMS байланышы' },
    { key: 'custom_roles_enabled', label: 'Ыңгайлаштырылган ролдор' },
    { key: 'custom_domain_enabled', label: 'Жеке домен' },
  ];

  // Available limits for visual editor
  const availableLimits = [
    { key: 'maxUsers', label: 'Макс. колдонуучулар', type: 'number' },
    { key: 'maxContacts', label: 'Макс. контакттар', type: 'number' },
    { key: 'maxLessons', label: 'Макс. сабактар', type: 'number' },
    { key: 'maxStudents', label: 'Макс. студенттер', type: 'number' },
    { key: 'storageGB', label: 'Сактоо (GB)', type: 'number' },
    { key: 'apiCallsPerMonth', label: 'API чакыруулар/ай', type: 'number' },
  ];
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

              {/* Visual Feature Editor */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Функциялар</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableFeatures.map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.features || {})[feature.key] === true}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            features: {
                              ...(formData.features || {}),
                              [feature.key]: e.target.checked,
                            },
                          });
                        }}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visual Limits Editor */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Лимиттер</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableLimits.map((limit) => (
                    <div key={limit.key}>
                      <label className="block text-sm text-gray-600 mb-1">{limit.label}</label>
                      <Input
                        type="number"
                        value={(formData.limits || {})[limit.key] !== undefined ? String((formData.limits || {})[limit.key]) : ''}
                        onChange={(e) => {
                          const numValue = e.target.value ? Number(e.target.value) : undefined;
                          const newLimits = { ...(formData.limits || {}) };
                          if (numValue !== undefined) {
                            newLimits[limit.key] = numValue;
                          } else {
                            delete newLimits[limit.key];
                          }
                          setFormData({
                            ...formData,
                            limits: newLimits,
                          });
                        }}
                        placeholder="0 = чексиз"
                      />
                    </div>
                  ))}
                </div>
              </div>
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

              {/* Visual Feature Editor */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Функциялар</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableFeatures.map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.features || {})[feature.key] === true}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            features: {
                              ...(formData.features || {}),
                              [feature.key]: e.target.checked,
                            },
                          });
                        }}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visual Limits Editor */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Лимиттер</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableLimits.map((limit) => (
                    <div key={limit.key}>
                      <label className="block text-sm text-gray-600 mb-1">{limit.label}</label>
                      <Input
                        type="number"
                        value={(formData.limits || {})[limit.key] !== undefined ? String((formData.limits || {})[limit.key]) : ''}
                        onChange={(e) => {
                          const numValue = e.target.value ? Number(e.target.value) : undefined;
                          const newLimits = { ...(formData.limits || {}) };
                          if (numValue !== undefined) {
                            newLimits[limit.key] = numValue;
                          } else {
                            delete newLimits[limit.key];
                          }
                          setFormData({
                            ...formData,
                            limits: newLimits,
                          });
                        }}
                        placeholder="0 = чексиз"
                      />
                    </div>
                  ))}
                </div>
              </div>
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
            <>
              {/* Plan Comparison Table */}
              <div className="mb-8 overflow-x-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Тарифтерди салыштыруу</h3>
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Функция/Лимит</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Pricing Row */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Баа (айлык)</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-sm text-center text-gray-900">
                          {plan.monthlyPrice ? `${plan.monthlyPrice} ${plan.currency}` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Баа (жылдык)</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-sm text-center text-gray-900">
                          {plan.yearlyPrice ? `${plan.yearlyPrice} ${plan.currency}` : '-'}
                        </td>
                      ))}
                    </tr>
                    {/* Features */}
                    {availableFeatures.map((feature) => (
                      <tr key={feature.key}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{feature.label}</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="px-4 py-3 text-center">
                            {plan.features[feature.key] ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full">
                                <X className="w-4 h-4" />
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Limits */}
                    {availableLimits.map((limit) => (
                      <tr key={limit.key}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{limit.label}</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="px-4 py-3 text-sm text-center text-gray-900">
                            {plan.limits[limit.key] !== undefined ? String(plan.limits[limit.key]) : '∞'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Plan Cards */}
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
                          <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        )}
                        {/* Improved Pricing Display */}
                        <div className="flex items-center space-x-4 mb-3">
                          {plan.monthlyPrice && (
                            <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
                              <span className="text-xs text-primary-600 block">Айлык</span>
                              <span className="text-lg font-bold text-primary-900">
                                {plan.monthlyPrice.toLocaleString()} {plan.currency}
                              </span>
                            </div>
                          )}
                          {plan.yearlyPrice && (
                            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                              <span className="text-xs text-green-600 block">Жылдык</span>
                              <span className="text-lg font-bold text-green-900">
                                {plan.yearlyPrice.toLocaleString()} {plan.currency}
                              </span>
                            </div>
                          )}
                          {plan.monthlyPrice && plan.yearlyPrice && (
                            <div className="text-xs text-gray-500">
                              {(plan.yearlyPrice / plan.monthlyPrice).toFixed(1)}x айлык
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          title="Оңдоо"
                          aria-label="Тарифти оңдоо"
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
                            aria-label="Тарифти өчүрүү"
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
                              aria-label="Тарифти активдештирүү"
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchive(plan)}
                              disabled={statusLoading === plan.id}
                              title="Архивдөө"
                              aria-label="Тарифти архивдөө"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    {Object.keys(plan.features).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Функциялардын тизмеси:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {availableFeatures.map((feature) => (
                            <div key={feature.key} className="flex items-center space-x-2 text-sm">
                              {plan.features[feature.key] ? (
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={plan.features[feature.key] ? 'text-gray-900' : 'text-gray-400'}>
                                {feature.label}
                              </span>
                            </div>
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
            </>
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
    </div >
  );
}
