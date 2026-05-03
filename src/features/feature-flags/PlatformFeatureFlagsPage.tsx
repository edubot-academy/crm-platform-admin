import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Alert } from '../../shared/components/Alert';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { FilterBar, FilterBarItem } from '../../shared/components/FilterBar';
import { Input } from '../../shared/components/Input';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionIntro } from '../../shared/components/SectionIntro';
import { Select } from '../../shared/components/Select';
import { Switch } from '../../shared/components/Switch';
import { platformFeatureFlagsApi, type FeatureFlag } from './platformFeatureFlagsApi';
import { Flag, Search, Info, ChevronDown, ChevronUp } from 'lucide-react';

// Feature flag display labels and descriptions for platform-wide availability
const FLAG_DISPLAY_INFO: Record<string, { label: string; description: string; isCore?: boolean }> = {
  custom_roles_enabled: {
    label: 'Ыңгайлаштырылган ролдордун жеткиликтүүлүгү',
    description: 'Уюмдар үчүн ыңгайлаштырылган ролдорду колдонуу мүмкүнчүлүгүн платформа деңгээлинде күйгүзөт же өчүрөт.',
  },
  custom_domain_enabled: {
    label: 'Жеке домендин жеткиликтүүлүгү',
    description: 'Уюмдарга жеке домен колдонуу мүмкүнчүлүгүн платформа деңгээлинде күйгүзөт же өчүрөт.',
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
  ai_assist_enabled: {
    label: 'AI жардамчысынын жеткиликтүүлүгү',
    description: 'AI жардамчысына байланышкан функцияларды платформа боюнча жеткиликтүү кылат. Бул жалпысынан AI мүмкүнчүлүктөрү үчүн негизги дарбаза.',
  },
  ai_followup_drafts_enabled: {
    label: 'AI жооп сунушу функциясынын жеткиликтүүлүгү',
    description: 'Лид, байланыш жана келишим карточкаларында follow-up жооп сунушун түзүү мүмкүнчүлүгүн платформа боюнча жеткиликтүү кылат.',
  },
};

export function PlatformFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const loadFlags = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformFeatureFlagsApi.getFeatureFlags();
      setFlags(data);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Функцияларды жүктөө мүмкүн болгон жок' : 'Функцияларды жүктөө мүмкүн болгон жок');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFlags();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadFlags]);

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    setUpdating(key);
    try {
      await platformFeatureFlagsApi.updateFeatureFlag(key, !currentEnabled);
      toast.success('Функция ийгиликтүү жаңыртылды');
      void loadFlags();
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err) ? err.response?.data?.message || 'Функцияны жаңыртууда ката кетти' : 'Функцияны жаңыртууда ката кетти';
      setError(errorMessage);
      toast.error(errorMessage);
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

  // Filter flags based on search and category
  const filteredFlags = flags.filter(flag => {
    const matchesSearch = searchQuery === '' ||
      FLAG_DISPLAY_INFO[flag.key]?.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === '' || flag.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(flags.map(f => f.category || 'Глобалдык жөндөөлөр')));

  const toggleDescription = (key: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div>
      <PageHeader
        title="Платформа функциялары"
        description="Бул бөлүмдө функциялар платформа деңгээлинде күйгүзүлөт же өчүрүлөт. Уюм үчүн жеткиликтүүлүк тарифке жана өзүнчө уруксаттарга жараша аныкталат."
      />

      <Alert variant="info" title="Платформа деңгээлиндеги башкаруу" className="mb-6">
        Эгер функция бул жерде өчүрүлсө, ал эч бир уюмга жеткиликтүү болбойт. Эгер күйгүзүлсө, аны колдонуу уюмдун тарифи жана өзүнчө уруксаттары аркылуу аныкталат.
      </Alert>

      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="Платформа функциялары"
            description="Бул жердеги күйгүзүү же өчүрүү бардык уюмдарга таасир этет. Ар бир уюм үчүн так жеткиликтүүлүк тарифке жана өзүнчө уруксаттарга жараша аныкталат."
          />
        </CardHeader>
        <CardContent>
          <FilterBar>
            <FilterBarItem grow>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-edubot-muted" />
                <Input
                  placeholder="Издөө..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FilterBarItem>
            <FilterBarItem widthClassName="w-full md:w-72">
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: '', label: 'Бардык категориялар' },
                  ...categories.map((cat) => ({ value: cat, label: cat })),
                ]}
                placeholder="Бардык категориялар"
              />
            </FilterBarItem>
          </FilterBar>

          {loading ? (
            <SkeletonTable rows={5} columns={2} />
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : flags.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="Функциялар табылган жок"
              description="Платформада функциялар табылган жок."
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFlags).map(([category, categoryFlags]) => {
                const filteredCategoryFlags = categoryFlags.filter(flag =>
                  filteredFlags.includes(flag)
                );
                if (filteredCategoryFlags.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-edubot-muted">{category}</h3>
                    <div className="space-y-3">
                      {filteredCategoryFlags.map((flag) => (
                        <div
                          key={flag.key}
                          className="flex items-start justify-between rounded-[1.5rem] border border-edubot-line bg-white/75 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-edubot-orange/35 hover:shadow-edubot-soft"
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-edubot-dark">
                                {FLAG_DISPLAY_INFO[flag.key]?.label || flag.name}
                                {FLAG_DISPLAY_INFO[flag.key]?.isCore && (
                                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                    Негизги модуль
                                  </span>
                                )}
                              </h3>
                              <Badge variant={flag.enabled ? 'success' : 'neutral'}>
                                {flag.enabled ? 'Күйгүзүлгөн' : 'Өчүрүлгөн'}
                              </Badge>
                            </div>
                            <div className="relative">
                              <p className={`text-sm text-edubot-muted ${expandedDescriptions.has(flag.key) ? '' : 'line-clamp-2'}`}>
                                {FLAG_DISPLAY_INFO[flag.key]?.description || flag.description || flag.key}
                              </p>
                              {((FLAG_DISPLAY_INFO[flag.key]?.description || flag.description)?.length || 0) > 100 && (
                                <button
                                  onClick={() => toggleDescription(flag.key)}
                                  className="mt-1 flex items-center text-xs text-primary-600 hover:text-primary-700"
                                  aria-label={expandedDescriptions.has(flag.key) ? 'Сүрөттөмөнү жашыруу' : 'Сүрөттөмөнү көрсөтүү'}
                                >
                                  {expandedDescriptions.has(flag.key) ? (
                                    <>
                                      Жашыруу <ChevronUp className="w-3 h-3 ml-1" />
                                    </>
                                  ) : (
                                    <>
                                      Көбүрөөк <ChevronDown className="w-3 h-3 ml-1" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <Switch
                              checked={flag.enabled}
                              onChange={() => handleToggle(flag.key, flag.enabled)}
                              disabled={updating === flag.key || FLAG_DISPLAY_INFO[flag.key]?.isCore}
                              ariaLabel={flag.enabled ? `${flag.name} өчүрүү` : `${flag.name} кошуу`}
                            />
                            {FLAG_DISPLAY_INFO[flag.key]?.isCore && (
                              <div className="flex items-center text-xs text-gray-500" title="Бул негизги модул">
                                <Info className="w-3 h-3 mr-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
