import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { SectionIntro } from '../../../shared/components/SectionIntro';
import { Select } from '../../../shared/components/Select';
import { tenantApi, type OnboardTenantData, type OnboardTenantResponse } from '../tenantApi';
import { plansApi, type Plan } from '../../plans/plansApi';

const ADMIN_ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менежер' },
];

const TENANT_STATUS_OPTIONS = [
  { value: 'active', label: 'Активдүү' },
  { value: 'inactive', label: 'Актив эмес' },
  { value: 'suspended', label: 'Токтотулган' },
  { value: 'archived', label: 'Архивделген' },
];

const LANGUAGE_OPTIONS = [
  { value: 'ky', label: 'Кыргызча' },
  { value: 'ru', label: 'Орусча' },
  { value: 'en', label: 'Англисче' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Bishkek', label: 'Бишкек (Asia/Bishkek)' },
  { value: 'Asia/Almaty', label: 'Алматы (Asia/Almaty)' },
  { value: 'Europe/Moscow', label: 'Москва (Europe/Moscow)' },
];

const CURRENCY_OPTIONS = [
  { value: 'KGS', label: 'Кыргыз сом (KGS)' },
  { value: 'KZT', label: 'Казак тенге (KZT)' },
  { value: 'RUB', label: 'Орус рубли (RUB)' },
  { value: 'USD', label: 'АКШ доллары (USD)' },
];

const INITIAL_FORM_DATA: OnboardTenantData = {
  name: '',
  slug: '',
  adminFullName: '',
  adminEmail: '',
  adminRole: 'admin',
  planId: '',
  status: 'active',
  defaultLanguage: 'ky',
  timezone: 'Asia/Bishkek',
  currency: 'KGS',
};

interface TenantOnboardFormProps {
  variant?: 'page' | 'modal';
  onCancel?: () => void;
  onCreated?: (tenantId: number) => void;
}

export function TenantOnboardForm({
  variant = 'page',
  onCancel,
  onCreated,
}: TenantOnboardFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OnboardTenantData>(INITIAL_FORM_DATA);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState('');
  const [onboardResult, setOnboardResult] = useState<OnboardTenantResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setPlansLoading(true);
        try {
          const data = await plansApi.getPlans();
          setPlans(data.filter((plan) => plan.status === 'active'));
        } catch (loadError) {
          console.error('Failed to load plans:', loadError);
        } finally {
          setPlansLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Компаниянын аталышын киргизиңиз';
    if (!formData.slug.trim()) return 'Слагты киргизиңиз';
    if (!/^[a-z0-9-]+$/.test(formData.slug)) return 'Слаг тек ачык тамгалар, сандар жана тире камтый алат';
    if (!formData.adminFullName.trim()) return 'Админ атын киргизиңиз';
    if (!formData.adminEmail.trim()) return 'Админ email киргизиңиз';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) return 'Туура админ email киргизиңиз';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOnboardResult(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await tenantApi.onboardTenant(formData);
      setOnboardResult(result);
      onCreated?.(result.tenantId);
    } catch (submitError) {
      setError(isAxiosError(submitError) ? submitError.response?.data?.message || 'Тенантты түзүүдө ката кетти' : 'Тенантты түзүүдө ката кетти');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOnboardResult(null);
    setError('');
    setFormData(INITIAL_FORM_DATA);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate('/platform/tenants');
  };

  const summaryCardClasses = 'rounded-[1.5rem] border border-edubot-line bg-white/80 p-4';
  const sectionCardClasses = 'border-t border-edubot-line pt-5';
  const planOptions = [
    { value: '', label: 'Тарифты тандаңыз (милдеттүү эмес)' },
    ...plans.map((plan) => ({
      value: plan.id,
      label: `${plan.name}${plan.monthlyPrice ? ` (${plan.monthlyPrice} ${plan.currency}/ай)` : ''}`,
    })),
  ];

  const intro = (
    <SectionIntro
      title="Тенант маалыматтары"
      description="Негизги компания маалыматын, биринчи администраторду жана баштапкы бренд параметрлерин толтуруңуз."
    />
  );

  const body = onboardResult ? (
    <div className="space-y-6">
      <Alert
        variant={onboardResult.success ? 'success' : 'warning'}
        title={onboardResult.success ? 'Тенант ийгиликтүү түзүлдү' : 'Тенант түзүлдү, бирок көңүл буруу керек'}
      >
        {onboardResult.message}
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={summaryCardClasses}>
          <h3 className="mb-1 text-sm font-medium uppercase tracking-[0.16em] text-edubot-muted">Тенант</h3>
          <p className="text-lg font-semibold text-edubot-dark">{onboardResult.tenantName}</p>
          <p className="text-sm text-edubot-muted">Слаг: {onboardResult.tenantSlug}</p>
          <p className="text-sm text-edubot-muted">Домен: {onboardResult.primaryDomain}</p>
          <p className="text-sm text-edubot-muted">Статус: {onboardResult.tenantStatus}</p>
        </div>

        <div className={summaryCardClasses}>
          <h3 className="mb-1 text-sm font-medium uppercase tracking-[0.16em] text-edubot-muted">Администратор</h3>
          <p className="text-base font-medium text-edubot-dark">{onboardResult.admin.name}</p>
          <p className="text-sm text-edubot-muted">{onboardResult.admin.email}</p>
          <p className="text-sm text-edubot-muted">Рөл: {onboardResult.admin.role}</p>
          {onboardResult.admin.inviteLink && (
            <a
              href={onboardResult.admin.inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-edubot-orange underline decoration-edubot-orange/30 underline-offset-4 hover:text-edubot-soft"
            >
              Чакырма шилтемеси
            </a>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {onboardResult.plan.name && (
          <div className={summaryCardClasses}>
            <h3 className="mb-1 text-sm font-medium uppercase tracking-[0.16em] text-edubot-muted">Тариф</h3>
            <p className="text-base font-medium text-edubot-dark">{onboardResult.plan.name}</p>
            <p className="text-sm text-edubot-muted">Код: {onboardResult.plan.code}</p>
          </div>
        )}

        {onboardResult.features && (
          <div className={summaryCardClasses}>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-edubot-muted">Функциялар</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(onboardResult.features).map(([key, value]) => (
                <span
                  key={key}
                  className={`rounded-full px-2 py-1 text-xs ${value ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  {key}: {value ? 'Ооба' : 'Жок'}
                </span>
              ))}
            </div>
          </div>
        )}

        {onboardResult.modules && (
          <div className={summaryCardClasses}>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-edubot-muted">Модулдар</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(onboardResult.modules).map(([key, value]) => (
                <span
                  key={key}
                  className={`rounded-full px-2 py-1 text-xs ${value ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  {key}: {value ? 'Ооба' : 'Жок'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 border-t border-edubot-line pt-4">
        <Button variant="secondary" onClick={handleReset}>
          Жаңы тенант түзүү
        </Button>
        {variant === 'modal' && (
          <Button variant="secondary" onClick={handleCancel}>
            Жабуу
          </Button>
        )}
        <Button onClick={() => navigate(`/platform/tenants/${onboardResult.tenantId}`)}>
          Тенантты көрүү
        </Button>
      </div>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Компаниянын аталышы"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="EduPro"
      />
      <div>
        <Input
          label="Слаг"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
          required
          placeholder="edupro"
        />
        <div className="mt-1 text-sm text-edubot-muted">
          CRM домени автоматтык түрдө түзүлөт: <span className="font-medium text-edubot-dark">{formData.slug || 'slug'}-crm.edubot.it.com</span>
        </div>
      </div>

      <div className={sectionCardClasses}>
        <SectionIntro title="Биринчи администратор" description="Тенант түзүлгөндөн кийин чакыруу жибериле турган негизги жооптуу адам." className="mb-4" />
        <Input
          label="Админ аты"
          value={formData.adminFullName}
          onChange={(e) => setFormData({ ...formData, adminFullName: e.target.value })}
          required
          placeholder="Азамат Усонов"
        />
        <Input
          label="Админ email"
          type="email"
          value={formData.adminEmail}
          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
          required
          placeholder="azamat@edupro.kg"
        />
        <Select
          label="Рөл"
          value={formData.adminRole}
          onChange={(value) => setFormData({ ...formData, adminRole: value as NonNullable<OnboardTenantData['adminRole']> })}
          options={ADMIN_ROLE_OPTIONS}
        />
      </div>

      <div className={sectionCardClasses}>
        <SectionIntro title="Тариф жана статус" description="Коммерциялык шаблонду жана баштапкы тенант статусун тандаңыз." className="mb-4" />
        {plansLoading ? (
          <div className="rounded-2xl border border-edubot-line bg-edubot-surfaceAlt/80 px-4 py-3 text-sm text-edubot-muted">
            Жүктөлүүдө...
          </div>
        ) : (
          <Select
            label="Тариф"
            value={formData.planId}
            onChange={(value) => setFormData({ ...formData, planId: value })}
            options={planOptions}
          />
        )}
        <Select
          label="Статус"
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value as NonNullable<OnboardTenantData['status']> })}
          options={TENANT_STATUS_OPTIONS}
        />
      </div>

      <div className={sectionCardClasses}>
        <SectionIntro title="Брендинг жана тил" description="Тенанттын индустриясын, бренд өңүн жана аймактык жөндөөлөрүн алдын ала бериңиз." className="mb-4" />
        <Input
          label="Өнөр жай"
          value={formData.industry || ''}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          placeholder="Билим берүү"
        />
        <Input
          label="Бренд түсү"
          value={formData.brandColor || ''}
          onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
          placeholder="#3B82F6"
        />
        <Input
          label="Лого URL"
          value={formData.logoUrl || ''}
          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
        />
        <Select
          label="Тил"
          value={formData.defaultLanguage}
          onChange={(value) => setFormData({ ...formData, defaultLanguage: value })}
          options={LANGUAGE_OPTIONS}
        />
        <Select
          label="Убакыт зонасы"
          value={formData.timezone}
          onChange={(value) => setFormData({ ...formData, timezone: value })}
          options={TIMEZONE_OPTIONS}
        />
        <Select
          label="Валюта"
          value={formData.currency}
          onChange={(value) => setFormData({ ...formData, currency: value })}
          options={CURRENCY_OPTIONS}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={loading}
        >
          Жокко чыгаруу
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Түзүлүүдө...' : 'Тенантты түзүү'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className={variant === 'modal' ? 'space-y-6' : 'max-w-3xl'}>
      {variant === 'modal' ? (
        <>
          {intro}
          <div className="mt-6">{body}</div>
        </>
      ) : (
        <Card className="app-surface">
          <CardHeader>{intro}</CardHeader>
          <CardContent>{body}</CardContent>
        </Card>
      )}
    </div>
  );
}
