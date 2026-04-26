import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { ArrowLeft } from 'lucide-react';
import { tenantApi, type CreateTenantData } from './tenantApi';

export function CreateTenantPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTenantData>({
    name: '',
    slug: '',
    primaryEmail: '',
    planId: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Компаниянын аталышын киргизиңиз';
    if (!formData.slug.trim()) return 'Слагты киргизиңиз';
    if (!/^[a-z0-9-]+$/.test(formData.slug)) return 'Слаг тек ачык тамгалар, сандар жана тире камтый алат';
    if (!formData.primaryEmail.trim()) return 'Email даректин киргизиңиз';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryEmail)) return 'Туура email дарек киргизиңиз';
    // planId is optional
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await tenantApi.createTenant(formData);
      setSuccess('Тенант ийгиликтүү түзүлдү');
      setTimeout(() => {
        navigate(`/platform/tenants/${result.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Тенантты түзүүдө ката кетти');
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Компаниянын аталышы"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="EduPro"
            />
            <Input
              label="Слаг"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
              required
              placeholder="edupro"
            />
            <Input
              label="Негизги email"
              type="email"
              value={formData.primaryEmail}
              onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
              required
              placeholder="admin@edupro.kg"
            />
            <Input
              label="Тариф ID"
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              placeholder="plan-uuid (милдеттүү эмес)"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Активдүү</option>
                <option value="inactive">Актив эмес</option>
                <option value="suspended">Токтотулган</option>
                <option value="archived">Архивделген</option>
              </select>
            </div>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}
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
                {loading ? 'Сактоо...' : 'Сактоо'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
