import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { platformFeatureFlagsApi, type FeatureFlag } from './platformFeatureFlagsApi';

export function PlatformFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformFeatureFlagsApi.getFeatureFlags();
      setFlags(data);
    } catch (err: any) {
      setError('Функцияларды жүктөө мүмкүн болгон жок');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    setUpdating(key);
    try {
      await platformFeatureFlagsApi.updateFeatureFlag(key, !currentEnabled);
      toast.success('Функция ийгиликтүү жаңыртылды');
      loadFlags();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Функцияны жаңыртууда ката кетти');
      toast.error(err.response?.data?.message || 'Функцияны жаңыртууда ката кетти');
    } finally {
      setUpdating(null);
    }
  };

  // Group flags by category
  const groupedFlags = flags.reduce((acc, flag) => {
    const category = flag.category || 'Глобалдык жөндөөлөр';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Функциялар</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Платформа функциялары</h2>
          <p className="text-sm text-gray-500 mt-1">
            Бул функциялар бүт платформага таасир этет
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : flags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Функциялар табылган жок</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                  <div className="space-y-3">
                    {categoryFlags.map((flag) => (
                      <div
                        key={flag.key}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{flag.name}</h3>
                            <Badge variant={flag.enabled ? 'success' : 'neutral'}>
                              {flag.enabled ? 'Активдүү' : 'Өчүрүлгөн'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{flag.description || flag.key}</p>
                        </div>
                        <button
                          onClick={() => handleToggle(flag.key, flag.enabled)}
                          disabled={updating === flag.key}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-blue-600' : 'bg-gray-200'
                            } ${updating === flag.key ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
