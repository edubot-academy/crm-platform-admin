import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { tenantApi, type OnboardTenantData, type OnboardTenantResponse } from './tenantApi';
import { plansApi, type Plan } from '../plans/plansApi';

export function CreateTenantPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OnboardTenantData>({
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
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState('');
  const [onboardResult, setOnboardResult] = useState<OnboardTenantResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const data = await plansApi.getPlans();
      setPlans(data.filter(p => p.status === 'active'));
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPlans();
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
    } catch (error) {
      setError(isAxiosError(error) ? error.response?.data?.message || 'Тенантты түзүүдө ката кетти' : 'Тенантты түзүүдө ката кетти');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOnboardResult(null);
    setError('');
    setFormData({
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
    });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/platform/tenants')} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Артка
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Жаңы тенант</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Тенант маалыматтары</h2>
        </CardHeader>
        <CardContent>
          {onboardResult ? (
            <div className="space-y-6">
              <div className={`flex items-start space-x-3 p-4 rounded-lg ${onboardResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                {onboardResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${onboardResult.success ? 'text-green-900' : 'text-yellow-900'}`}>
                    {onboardResult.message}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Тенант</h3>
                  <p className="text-lg font-semibold text-gray-900">{onboardResult.tenantName}</p>
                  <p className="text-sm text-gray-600">Слаг: {onboardResult.tenantSlug}</p>
                  <p className="text-sm text-gray-600">Домен: {onboardResult.primaryDomain}</p>
                  <p className="text-sm text-gray-600">Статус: {onboardResult.tenantStatus}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Администратор</h3>
                  <p className="text-base font-medium text-gray-900">{onboardResult.admin.name}</p>
                  <p className="text-sm text-gray-600">{onboardResult.admin.email}</p>
                  <p className="text-sm text-gray-600">Рөл: {onboardResult.admin.role}</p>
                  {onboardResult.admin.inviteLink && (
                    <a
                      href={onboardResult.admin.inviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Чакырма шилтемеси
                    </a>
                  )}
                </div>

                {onboardResult.plan.name && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Тариф</h3>
                    <p className="text-base font-medium text-gray-900">{onboardResult.plan.name}</p>
                    <p className="text-sm text-gray-600">Код: {onboardResult.plan.code}</p>
                  </div>
                )}

                {onboardResult.features && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Функциялар</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(onboardResult.features).map(([key, value]) => (
                        <span
                          key={key}
                          className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {key}: {value ? 'Ооба' : 'Жок'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {onboardResult.modules && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Модулдар</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(onboardResult.modules).map(([key, value]) => (
                        <span
                          key={key}
                          className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {key}: {value ? 'Ооба' : 'Жок'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                >
                  Жаңы тенант түзүү
                </Button>
                <Button
                  onClick={() => navigate(`/platform/tenants/${onboardResult.tenantId}`)}
                >
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
                <div className="mt-1 text-sm text-gray-500">
                  CRM домени автоматтык түрдө түзүлөт: <span className="font-medium">{formData.slug || 'slug'}-crm.edubot.it.com</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Биринчи администратор (милдеттүү)</h3>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Рөл
                  </label>
                  <select
                    value={formData.adminRole}
                    onChange={(e) => setFormData({ ...formData, adminRole: e.target.value as NonNullable<OnboardTenantData['adminRole']> })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Администратор</option>
                    <option value="manager">Менежер</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Тариф жана статус (милдеттүү эмес)</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тариф
                  </label>
                  {plansLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                      Жүктөлүүдө...
                    </div>
                  ) : (
                    <select
                      value={formData.planId}
                      onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Тарифты тандаңыз (милдеттүү эмес)</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} {plan.monthlyPrice ? `(${plan.monthlyPrice} ${plan.currency}/ай)` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as NonNullable<OnboardTenantData['status']> })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Активдүү</option>
                    <option value="inactive">Актив эмес</option>
                    <option value="suspended">Токтотулган</option>
                    <option value="archived">Архивделген</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Брендинг жана тил (милдеттүү эмес)</h3>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тил
                  </label>
                  <select
                    value={formData.defaultLanguage}
                    onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ky">Кыргызча</option>
                    <option value="ru">Орусча</option>
                    <option value="en">Англисче</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Убакыт зонасы
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Bishkek">Бишкек (Asia/Bishkek)</option>
                    <option value="Asia/Almaty">Алматы (Asia/Almaty)</option>
                    <option value="Europe/Moscow">Москва (Europe/Moscow)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Валюта
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="KGS">Кыргыз сом (KGS)</option>
                    <option value="KZT">Казак тенге (KZT)</option>
                    <option value="RUB">Орус рубли (RUB)</option>
                    <option value="USD">АКШ доллары (USD)</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/platform/tenants')}
                  disabled={loading}
                >
                  Жокко чыгаруу
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Түзүлүүдө...' : 'Тенантты түзүү'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
