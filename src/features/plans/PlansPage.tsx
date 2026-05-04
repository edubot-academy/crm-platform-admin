import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { FormModal } from '../../shared/components/FormModal';
import { Input } from '../../shared/components/Input';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionIntro } from '../../shared/components/SectionIntro';
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
  type FeatureItem = { key: string; label: string };

  const featureGroups: Array<{ title: string; items: readonly FeatureItem[] }> = [
    {
      title: 'Негизги модулдар',
      items: [
        { key: 'crm_enabled', label: 'CRM модулу' },
        { key: 'payments_enabled', label: 'Төлөмдөр' },
        { key: 'trial_lessons_enabled', label: 'Сыноо сабактар' },
        { key: 'retention_enabled', label: 'Студентти кармап калуу' },
        { key: 'advanced_reports_enabled', label: 'Кеңейтилген отчеттор' },
      ] as const,
    },
    {
      title: 'Интеграциялар жана кошумчалар',
      items: [
        { key: 'telegram_notifications_enabled', label: 'Telegram билдирүүлөр' },
        { key: 'whatsapp_integration_enabled', label: 'WhatsApp интеграциясы' },
        { key: 'lms_bridge_enabled', label: 'LMS байланышы' },
        { key: 'custom_roles_enabled', label: 'Ыңгайлаштырылган ролдор' },
        { key: 'custom_domain_enabled', label: 'Жеке домен' },
      ] as const,
    },
    {
      title: 'AI мүмкүнчүлүктөрү',
      items: [
        { key: 'ai_assist_enabled', label: 'AI жардамчысы' },
        { key: 'ai_followup_drafts_enabled', label: 'AI жооп сунушу' },
        { key: 'ai_operator_guidance_enabled', label: 'AI сунуштары' },
        { key: 'ai_insight_persistence_enabled', label: 'AI жыйынтыктарын сактоо' },
      ] as const,
    },
  ];
  const availableFeatures: FeatureItem[] = featureGroups.flatMap((group) => group.items);

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

  const loadPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await plansApi.getPlans();
      setPlans(data);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Тарифтерди жүктөөдө ката кетти' : 'Тарифтерди жүктөөдө ката кетти');
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await plansApi.getPlans();
        setPlans(data);
      } catch (err: unknown) {
        setError(isAxiosError(err) ? err.response?.data?.message || 'Тарифтерди жүктөөдө ката кетти' : 'Тарифтерди жүктөөдө ката кетти');
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Тарифтин аталышын киргизиңиз';
    if (!formData.code.trim()) return 'Кодду киргизиңиз';
    if (!/^[a-z0-9-]+$/.test(formData.code)) return 'Код кичине латин тамгаларынан, сандардан жана дефистен турушу керек';
    return null;
  };

  const normalizePriceInput = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const sanitizePlanPayload = (data: CreatePlanData): CreatePlanData => ({
    ...data,
    monthlyPrice:
      typeof data.monthlyPrice === 'number' && Number.isFinite(data.monthlyPrice)
        ? data.monthlyPrice
        : undefined,
    yearlyPrice:
      typeof data.yearlyPrice === 'number' && Number.isFinite(data.yearlyPrice)
        ? data.yearlyPrice
        : undefined,
  });

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
      await plansApi.createPlan(sanitizePlanPayload(formData));
      toast.success('Тариф ийгиликтүү түзүлдү');
      setShowCreateForm(false);
      resetForm();
      void loadPlans();
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err) ? err.response?.data?.message || 'Тарифти түзүүдө ката кетти' : 'Тарифти түзүүдө ката кетти';
      setFormError(errorMessage);
      toast.error(errorMessage);
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
      await plansApi.updatePlan(editingPlan.id, sanitizePlanPayload(formData));
      toast.success('Тариф ийгиликтүү жаңыртылды');
      setShowEditForm(false);
      setEditingPlan(null);
      resetForm();
      void loadPlans();
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err) ? err.response?.data?.message || 'Тарифти жаңыртууда ката кетти' : 'Тарифти жаңыртууда ката кетти';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (planId: string, newStatus: PlanStatus) => {
    setStatusLoading(planId);
    try {
      await plansApi.updatePlanStatus(planId, { status: newStatus });
      toast.success('Тарифтин статусу ийгиликтүү өзгөртүлдү');
      void loadPlans();
    } catch (err: unknown) {
      console.error('Failed to update plan status:', err);
      toast.error(isAxiosError(err) ? err.response?.data?.message || 'Статусту өзгөртүүдө ката кетти' : 'Статусту өзгөртүүдө ката кетти');
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
      message: 'Бул тариф архивге жөнөтүлөт. Архивдеги тариф жаңы уюмдарга дайындалбайт. Улантасызбы?',
      onConfirm: () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
        handleStatusChange(plan.id, 'archived');
      },
    });
  };

  const panelClasses = 'rounded-[1.5rem] border border-edubot-line/80 bg-white/70 p-4 backdrop-blur-sm';
  const optionCardClasses = 'flex items-center gap-3 rounded-2xl border border-edubot-line bg-white/80 p-3 transition-colors hover:border-edubot-orange/40 hover:bg-edubot-orange/5';

  return (
    <div>
      <PageHeader
        title="Тарифтер"
        description="Пландарды баасы, модулдары жана чектөөлөрү боюнча түшүнүктүү түрдө башкарыңыз."
        actions={(
          <Button onClick={() => { setShowCreateForm(!showCreateForm); resetForm(); }}>
            <Plus className="mr-2 h-4 w-4" />
            Жаңы тариф кошуу
          </Button>
        )}
      />

      <FormModal
        isOpen={showCreateForm}
        title="Жаңы тариф түзүү"
        description="Жаңы коммерциялык планды, анын лимиттерин жана модулдарын бир терезеде аныктаңыз."
        maxWidthClassName="max-w-4xl"
        onClose={() => { setShowCreateForm(false); resetForm(); }}
      >
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
              value={formData.monthlyPrice ?? ''}
              onChange={(e) => setFormData({ ...formData, monthlyPrice: normalizePriceInput(e.target.value) })}
              placeholder="5000"
            />
            <Input
              label="Жылдык баа"
              type="number"
              value={formData.yearlyPrice ?? ''}
              onChange={(e) => setFormData({ ...formData, yearlyPrice: normalizePriceInput(e.target.value) })}
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
          <div className={panelClasses}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-edubot-muted">Функциялар</h3>
            <div className="space-y-4">
              {featureGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted">{group.title}</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {group.items.map((feature) => (
                      <label key={feature.key} className={`${optionCardClasses} cursor-pointer`}>
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
                          className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-edubot-ink">{feature.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Limits Editor */}
          <div className={panelClasses}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-edubot-muted">Лимиттер</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableLimits.map((limit) => (
                <div key={limit.key}>
                  <label className="mb-1 block text-sm text-edubot-muted">{limit.label}</label>
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
            <Alert variant="error">{formError}</Alert>
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
      </FormModal>

      <FormModal
        isOpen={showEditForm && !!editingPlan}
        title="Тарифти оңдоо"
        description="Тандалган тарифтин баасын, модулдарын жана лимиттерин жаңыртыңыз."
        maxWidthClassName="max-w-4xl"
        onClose={() => { setShowEditForm(false); setEditingPlan(null); resetForm(); }}
      >
        {editingPlan && (
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
                value={formData.monthlyPrice ?? ''}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: normalizePriceInput(e.target.value) })}
              />
              <Input
                label="Жылдык баа"
                type="number"
                value={formData.yearlyPrice ?? ''}
                onChange={(e) => setFormData({ ...formData, yearlyPrice: normalizePriceInput(e.target.value) })}
              />
            </div>
            <Input
              label="Валюта"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            />

            {/* Visual Feature Editor */}
            <div className={panelClasses}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-edubot-muted">Функциялар</h3>
              <div className="space-y-4">
                {featureGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted">{group.title}</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {group.items.map((feature) => (
                        <label key={feature.key} className={`${optionCardClasses} cursor-pointer`}>
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
                            className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-edubot-ink">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Limits Editor */}
            <div className={panelClasses}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-edubot-muted">Лимиттер</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableLimits.map((limit) => (
                  <div key={limit.key}>
                    <label className="mb-1 block text-sm text-edubot-muted">{limit.label}</label>
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
              <Alert variant="error">{formError}</Alert>
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
        )}
      </FormModal>

      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="Платформа тарифтери"
            description="Уюмдар үчүн жеткиликтүү тариф пландары"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard showHeader lines={4} />
              <SkeletonCard showHeader lines={4} />
              <SkeletonCard showHeader lines={4} />
            </div>
          ) : error ? (
            <Alert variant="error">{error}</Alert>
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
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-edubot-muted">Тарифтерди салыштыруу</h3>
                <table className="min-w-full overflow-hidden rounded-[1.5rem] border border-edubot-line">
                  <thead className="bg-edubot-surfaceAlt/80">
                    <tr>
                      <th className="border-b border-edubot-line px-4 py-3 text-left text-sm font-semibold text-edubot-dark">Функция/Лимит</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="border-b border-edubot-line px-4 py-3 text-center text-sm font-semibold text-edubot-dark">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edubot-line bg-white/85">
                    {/* Pricing Row */}
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-edubot-muted">Баа (айлык)</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-edubot-ink">
                          {plan.monthlyPrice ? `${plan.monthlyPrice} ${plan.currency}` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-edubot-muted">Баа (жылдык)</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center text-sm text-edubot-ink">
                          {plan.yearlyPrice ? `${plan.yearlyPrice} ${plan.currency}` : '-'}
                        </td>
                      ))}
                    </tr>
                    {/* Features */}
                    {availableFeatures.map((feature) => (
                      <tr key={feature.key}>
                        <td className="px-4 py-3 text-sm font-medium text-edubot-muted">{feature.label}</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="px-4 py-3 text-center">
                            {plan.features[feature.key] ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
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
                        <td className="px-4 py-3 text-sm font-medium text-edubot-muted">{limit.label}</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="px-4 py-3 text-center text-sm text-edubot-ink">
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
                    className="rounded-[1.75rem] border border-edubot-line bg-white/80 p-6 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:shadow-edubot-hover"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-edubot-dark">{plan.name}</h3>
                          <Badge variant="neutral">{plan.code}</Badge>
                          {getStatusBadge(plan.status)}
                        </div>
                        {plan.description && (
                          <p className="mb-3 text-sm text-edubot-muted">{plan.description}</p>
                        )}
                        {/* Improved Pricing Display */}
                        <div className="flex items-center space-x-4 mb-3">
                          {plan.monthlyPrice && (
                            <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-2">
                              <span className="text-xs text-primary-600 block">Айлык</span>
                              <span className="text-lg font-bold text-primary-900">
                                {plan.monthlyPrice.toLocaleString()} {plan.currency}
                              </span>
                            </div>
                          )}
                          {plan.yearlyPrice && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                              <span className="text-xs text-green-600 block">Жылдык</span>
                              <span className="text-lg font-bold text-green-900">
                                {plan.yearlyPrice.toLocaleString()} {plan.currency}
                              </span>
                            </div>
                          )}
                          {plan.monthlyPrice && plan.yearlyPrice && (
                            <div className="text-xs text-edubot-muted">
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
                      <div className="mt-4 border-t border-edubot-line pt-4">
                        <h4 className="mb-3 text-sm font-medium text-edubot-dark">Функциялар</h4>
                        <div className="space-y-4">
                          {featureGroups.map((group) => (
                            <div key={group.title}>
                              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted">{group.title}</p>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {group.items.map((feature) => (
                                  <div key={feature.key} className="flex items-center space-x-2 text-sm">
                                    {plan.features[feature.key] ? (
                                      <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                    ) : (
                                      <X className="h-4 w-4 flex-shrink-0 text-slate-400" />
                                    )}
                                    <span className={plan.features[feature.key] ? 'text-edubot-ink' : 'text-slate-400'}>
                                      {feature.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {Object.keys(plan.limits).length > 0 && (
                      <div className="mt-4 border-t border-edubot-line pt-4">
                        <h4 className="mb-2 text-sm font-medium text-edubot-dark">Лимиттер:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                          {Object.entries(plan.limits).map(([key, value]) => {
                            const label = availableLimits.find((limit) => limit.key === key)?.label || key;
                            return (
                              <div key={key} className="text-edubot-muted">
                                <span className="font-medium">{label}:</span> {String(value)}
                              </div>
                            );
                          })}
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
