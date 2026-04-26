import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { platformFeatureFlagsApi, type FeatureFlag } from './platformFeatureFlagsApi';
import { Flag } from 'lucide-react';

// Feature flag display labels and descriptions for platform-wide availability
const FLAG_DISPLAY_INFO: Record<string, { label: string; description: string; isCore?: boolean }> = {
  custom_roles_enabled: {
    label: 'Ыңгайлаштырылган ролдордун жеткиликтүүлүгү',
    description: 'Тенанттар үчүн ыңгайлаштырылган ролдорду колдонуу мүмкүнчүлүгүн платформа деңгээлинде күйгүзөт же өчүрөт.',
  },
  custom_domain_enabled: {
    label: 'Жеке домендин жеткиликтүүлүгү',
    description: 'Тенанттарга жеке домен колдонуу мүмкүнчүлүгүн платформа деңгээлинде күйгүзөт же өчүрөт.',
  },
  crm_enabled: {
    label: 'CRM негизги модулунун жеткиликтүүлүгү',
    description: 'CRMдин негизги мүмкүнчүлүктөрүн платформа деңгээлинде жеткиликтүү кылат. Бул негизги модуль болгондуктан, адатта өчүрүлбөйт.',
    isCore: true,
  },
  trial_lessons_enabled: {
    label: 'Сыноо сабактардын жеткиликтүүлүгү',
    description: 'Сыноо сабактар модулун платформа боюнча жеткиликтүү же жеткиликсиз кылат.',
  },
  retention_enabled: {
    label: 'Студентти кармап калуу модулунун жеткиликтүүлүгү',
    description: 'Студентти кармап калуу жана тобокелдик учурларын башкаруу модулун платформа боюнча жеткиликтүү кылат.',
  },
  telegram_notifications_enabled: {
    label: 'Telegram билдирүүлөрүнүн жеткиликтүүлүгү',
    description: 'Telegram аркылуу билдирүү жөнөтүү мүмкүнчүлүгүн платформа боюнча жеткиликтүү кылат.',
  },
  whatsapp_integration_enabled: {
    label: 'WhatsApp интеграциясынын жеткиликтүүлүгү',
    description: 'WhatsApp интеграциясын платформа боюнча жеткиликтүү кылат.',
  },
  advanced_reports_enabled: {
    label: 'Кеңейтилген отчеттордун жеткиликтүүлүгү',
    description: 'Кеңейтилген отчеттор жана аналитика модулун платформа боюнча жеткиликтүү кылат.',
  },
  lms_bridge_enabled: {
    label: 'LMS байланышынын жеткиликтүүлүгү',
    description: 'CRM менен LMS ортосундагы байланышты платформа боюнча жеткиликтүү кылат.',
  },
  payments_enabled: {
    label: 'Төлөмдөр модулунун жеткиликтүүлүгү',
    description: 'Төлөмдөрдү көзөмөлдөө жана эсеп-кысап модулун платформа боюнча жеткиликтүү кылат.',
  },
};

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Платформа мүмкүнчүлүктөрү</h1>

      <Card className="mb-6">
        <CardContent className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-2">
            Бул бөлүм функциялардын бүт платформа боюнча жеткиликтүүлүгүн башкарат. Бул тенанттын тарифи же жеке уруксаты эмес.
          </p>
          <p className="text-sm text-blue-800">
            Эгер функция бул жерде өчүрүлсө, ал эч бир тенантка жеткиликтүү болбойт. Эгер күйгүзүлсө, аны колдонуу тенанттын тарифи жана өзгөчө уруксаттары аркылуу аныкталат.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Платформа мүмкүнчүлүктөрү</h2>
          <p className="text-sm text-gray-500 mt-1">
            Бул жердеги күйгүзүү/өчүрүү бардык тенанттарга тиешелүү master switch болуп эсептелет. Тенанттын конкреттүү мүмкүнчүлүгү тариф жана tenant override аркылуу чечилет.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} columns={2} />
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : flags.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="Функциялар табылган жок"
              description="Платформада мүмкүнчүлүктөр жок. Системадан маалымат алыңыз."
            />
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
                            <h3 className="font-medium text-gray-900">
                              {FLAG_DISPLAY_INFO[flag.key]?.label || flag.name}
                              {FLAG_DISPLAY_INFO[flag.key]?.isCore && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  Негизги модуль
                                </span>
                              )}
                            </h3>
                            <Badge variant={flag.enabled ? 'success' : 'neutral'}>
                              {flag.enabled ? 'Платформада жеткиликтүү' : 'Платформада өчүрүлгөн'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {FLAG_DISPLAY_INFO[flag.key]?.description || flag.description || flag.key}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggle(flag.key, flag.enabled)}
                          disabled={updating === flag.key || FLAG_DISPLAY_INFO[flag.key]?.isCore}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-blue-600' : 'bg-gray-200'
                            } ${updating === flag.key || FLAG_DISPLAY_INFO[flag.key]?.isCore ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={FLAG_DISPLAY_INFO[flag.key]?.isCore ? 'Негизги модул өчүрүлбөйт' : ''}
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
