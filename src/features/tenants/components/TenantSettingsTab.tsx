import { useEffect, useState, type FormEvent } from 'react';
import type { Tenant } from '../tenantApi';
import {
  tenantSettingsApi,
  type PlatformTenantWhatsAppFailedEvent,
  type PlatformTenantWhatsAppHealth,
  type PlatformTenantWhatsAppSettings,
  type TenantConfig,
  type UpdateTenantConfigDto,
} from '../tenantSettingsApi';
import toast from 'react-hot-toast';
import { Alert } from '../../../shared/components/Alert';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Input } from '../../../shared/components/Input';
import { SectionIntro } from '../../../shared/components/SectionIntro';
import { MessageSquare, Settings } from 'lucide-react';
import { SkeletonCard } from '../../../shared/components/SkeletonCard';

interface TenantSettingsTabProps {
  settingsLoading: boolean;
  tenant: Tenant;
  settings: TenantConfig | null;
  settingsForm: UpdateTenantConfigDto;
  onSettingsFormChange: (next: UpdateTenantConfigDto) => void;
  enabledModuleKeys: string[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  settingsSaving: boolean;
}

type WhatsAppFormState = {
  whatsapp_business_account_id: string;
  phone_number_id: string;
  display_phone_number: string;
  access_token: string;
};

const emptyWhatsAppForm: WhatsAppFormState = {
  whatsapp_business_account_id: '',
  phone_number_id: '',
  display_phone_number: '',
  access_token: '',
};

export function TenantSettingsTab({
  settingsLoading,
  tenant,
  settings,
  settingsForm,
  onSettingsFormChange,
  enabledModuleKeys,
  onSubmit,
  settingsSaving,
}: TenantSettingsTabProps) {
  const whatsappFeatureEnabled = tenant.features?.whatsapp_integration_enabled === true;
  const whatsappModuleEnabled = settings?.enabledModules?.whatsapp === true || tenant.modules?.whatsapp === true;
  const hasAssignedPlan = Boolean(tenant.plan?.id);
  const releaseReady = whatsappFeatureEnabled && whatsappModuleEnabled && hasAssignedPlan && tenant.status === 'active';
  const [whatsAppSettings, setWhatsAppSettings] = useState<PlatformTenantWhatsAppSettings | null>(null);
  const [whatsAppHealth, setWhatsAppHealth] = useState<PlatformTenantWhatsAppHealth | null>(null);
  const [whatsAppFailedEvents, setWhatsAppFailedEvents] = useState<PlatformTenantWhatsAppFailedEvent[]>([]);
  const [whatsAppLoading, setWhatsAppLoading] = useState(true);
  const [whatsAppSaving, setWhatsAppSaving] = useState(false);
  const [whatsAppForm, setWhatsAppForm] = useState<WhatsAppFormState>(emptyWhatsAppForm);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);

  const syncWhatsAppForm = (settings: PlatformTenantWhatsAppSettings | null) => {
    if (!settings) {
      setWhatsAppForm(emptyWhatsAppForm);
      return;
    }

    setWhatsAppForm({
      whatsapp_business_account_id: settings.whatsapp_business_account_id || '',
      phone_number_id: settings.phone_number_id || '',
      display_phone_number: settings.display_phone_number || '',
      access_token: '',
    });
  };

  const loadWhatsAppData = async () => {
    setWhatsAppLoading(true);
    setWhatsAppError(null);

    try {
      const [settingsResponse, healthResponse, failedEvents] = await Promise.all([
        tenantSettingsApi.getTenantWhatsAppSettings(String(tenant.id)).catch(() => ({ message: 'not-configured' } as const)),
        tenantSettingsApi.getTenantWhatsAppHealth(String(tenant.id)).catch(() => null),
        tenantSettingsApi.getTenantWhatsAppFailedEvents(String(tenant.id), 5).catch(() => []),
      ]);

      const settings = 'id' in settingsResponse ? settingsResponse : null;
      setWhatsAppSettings(settings);
      syncWhatsAppForm(settings);
      setWhatsAppHealth(healthResponse);
      setWhatsAppFailedEvents(failedEvents);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WhatsApp жөндөөлөрүн жүктөө мүмкүн болгон жок';
      setWhatsAppError(message);
      setWhatsAppSettings(null);
      setWhatsAppHealth(null);
      setWhatsAppFailedEvents([]);
      syncWhatsAppForm(null);
    } finally {
      setWhatsAppLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      await loadWhatsAppData();
      if (!isMounted) return;
    })();

    return () => {
      isMounted = false;
    };
  }, [tenant.id]);

  const handleWhatsAppFormChange = (field: keyof WhatsAppFormState, value: string) => {
    setWhatsAppForm((current) => ({ ...current, [field]: value }));
  };

  const handleWhatsAppSave = async () => {
    setWhatsAppSaving(true);
    setWhatsAppError(null);

    try {
      const response = whatsAppSettings
        ? await tenantSettingsApi.updateTenantWhatsAppSettings(String(tenant.id), {
            whatsapp_business_account_id: whatsAppForm.whatsapp_business_account_id.trim() || undefined,
            phone_number_id: whatsAppForm.phone_number_id.trim() || undefined,
            display_phone_number: whatsAppForm.display_phone_number.trim() || undefined,
            access_token: whatsAppForm.access_token.trim() || undefined,
          })
        : await tenantSettingsApi.createTenantWhatsAppSettings(String(tenant.id), {
            whatsapp_business_account_id: whatsAppForm.whatsapp_business_account_id.trim(),
            phone_number_id: whatsAppForm.phone_number_id.trim(),
            display_phone_number: whatsAppForm.display_phone_number.trim(),
            access_token: whatsAppForm.access_token.trim(),
          });

      setWhatsAppSettings(response.account);
      syncWhatsAppForm(response.account);
      toast.success(response.message);
      await loadWhatsAppData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WhatsApp жөндөөлөрүн сактоо ишке ашкан жок';
      setWhatsAppError(message);
      toast.error(message);
    } finally {
      setWhatsAppSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="WhatsApp Release 3 даярдыгы"
            description="Platform admin үчүн tenant деңгээлиндеги entitlement, rollout жана credential башкаруу көрүнүшү."
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-edubot-line/80 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-edubot-muted">Release 3</p>
              <div className="mt-2">
                <Badge variant={releaseReady ? 'success' : 'warning'}>
                  {releaseReady ? 'Даяр' : 'Толук эмес'}
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-edubot-line/80 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-edubot-muted">Feature flag</p>
              <div className="mt-2">
                <Badge variant={whatsappFeatureEnabled ? 'success' : 'warning'}>
                  {whatsappFeatureEnabled ? 'Иштетилген' : 'Өчүк'}
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-edubot-line/80 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-edubot-muted">Модуль</p>
              <div className="mt-2">
                <Badge variant={whatsappModuleEnabled ? 'success' : 'neutral'}>
                  {whatsappModuleEnabled ? 'Көрсөтүлөт' : 'Жашыруун'}
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-edubot-line/80 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-edubot-muted">Тариф</p>
              <div className="mt-2">
                <Badge variant={hasAssignedPlan ? 'info' : 'warning'}>
                  {tenant.plan?.name || 'Байланган эмес'}
                </Badge>
              </div>
            </div>
          </div>

          <Alert variant="info" title="Platform admin көзөмөлү">
            Бул бөлүмдөн tenant үчүн WhatsApp credential'дарын түзүп же жаңырта аласыз. Бул rollout абалын, webhook
            саламаттыгын жана акыркы каталарды дагы көрсөтөт.
          </Alert>

          <div className="rounded-2xl border border-edubot-line/80 bg-white/70 px-4 py-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-4 w-4 text-edubot-orange" />
              <div className="space-y-2 text-sm text-edubot-muted">
                <p>
                  Tenant статусу: <span className="font-medium text-edubot-dark">{tenant.status}</span>
                </p>
                <p>
                  WhatsApp feature flag: <span className="font-medium text-edubot-dark">{whatsappFeatureEnabled ? 'true' : 'false'}</span>
                </p>
                <p>
                  Tenant module map: <span className="font-medium text-edubot-dark">{whatsappModuleEnabled ? 'whatsapp enabled' : 'whatsapp hidden'}</span>
                </p>
              </div>
            </div>
          </div>

          {whatsAppLoading ? (
            <SkeletonCard lines={3} />
          ) : (
            <div className="rounded-2xl border border-edubot-line/80 bg-white/70 px-4 py-4">
              {whatsAppError ? (
                <Alert variant="error" className="mb-4" title="WhatsApp жөндөөлөрү">
                  {whatsAppError}
                </Alert>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm text-edubot-muted">
                  <p>
                    Конфигурация: <span className="font-medium text-edubot-dark">{whatsAppHealth?.configured ? 'Ооба' : 'Жок'}</span>
                  </p>
                  <p>
                    Байланыш абалы: <span className="font-medium text-edubot-dark">{whatsAppHealth?.connected ? 'Туташкан' : 'Туташкан эмес'}</span>
                  </p>
                  <p>
                    Көрсөтүлгөн номер: <span className="font-medium text-edubot-dark">{whatsAppSettings?.display_phone_number || '—'}</span>
                  </p>
                  <p>
                    Акыркы текшерүү: <span className="font-medium text-edubot-dark">{formatDateTime(whatsAppSettings?.last_verified_at)}</span>
                  </p>
                </div>
                <div className="space-y-2 text-sm text-edubot-muted">
                  <p>
                    Акыркы webhook: <span className="font-medium text-edubot-dark">{formatDateTime(whatsAppHealth?.lastWebhookAt)}</span>
                  </p>
                  <p>
                    Акыркы ийгиликтүү webhook: <span className="font-medium text-edubot-dark">{formatDateTime(whatsAppHealth?.lastSuccessfulWebhookAt)}</span>
                  </p>
                  <p>
                    Акыркы сүйлөшүү активдүүлүгү: <span className="font-medium text-edubot-dark">{formatDateTime(whatsAppHealth?.lastConversationActivityAt)}</span>
                  </p>
                  <p>
                    Ката саны: <span className="font-medium text-edubot-dark">{whatsAppHealth?.failedWebhookCount ?? 0}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="WhatsApp Business Account ID"
                  value={whatsAppForm.whatsapp_business_account_id}
                  onChange={(event) => handleWhatsAppFormChange('whatsapp_business_account_id', event.target.value)}
                  placeholder="1234567890"
                />
                <Input
                  label="Phone Number ID"
                  value={whatsAppForm.phone_number_id}
                  onChange={(event) => handleWhatsAppFormChange('phone_number_id', event.target.value)}
                  placeholder="10987654321"
                />
                <Input
                  label="Көрсөтүлгөн номер"
                  value={whatsAppForm.display_phone_number}
                  onChange={(event) => handleWhatsAppFormChange('display_phone_number', event.target.value)}
                  placeholder="+996 500 000 000"
                />
                <Input
                  label={whatsAppSettings ? 'Жаңы access token' : 'Access token'}
                  type="password"
                  value={whatsAppForm.access_token}
                  onChange={(event) => handleWhatsAppFormChange('access_token', event.target.value)}
                  placeholder={whatsAppSettings?.access_token_preview || 'EAAG...'}
                  helperText={
                    whatsAppSettings?.access_token_preview
                      ? `Сакталган токен: ${whatsAppSettings.access_token_preview}`
                      : undefined
                  }
                />
              </div>

              {whatsAppHealth?.lastError ? (
                <Alert variant="warning" className="mt-4" title="Акыркы WhatsApp ката">
                  {whatsAppHealth.lastError}
                </Alert>
              ) : null}

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => void handleWhatsAppSave()}
                  disabled={
                    whatsAppSaving
                    || !whatsAppForm.whatsapp_business_account_id.trim()
                    || !whatsAppForm.phone_number_id.trim()
                    || !whatsAppForm.display_phone_number.trim()
                    || (!whatsAppSettings && !whatsAppForm.access_token.trim())
                  }
                >
                  {whatsAppSaving ? 'Сактоо...' : whatsAppSettings ? 'WhatsApp жаңыртуу' : 'WhatsApp туташтыруу'}
                </Button>
              </div>

              {whatsAppFailedEvents.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-edubot-dark">Акыркы webhook каталары</p>
                  {whatsAppFailedEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-edubot-line/80 bg-slate-50 px-4 py-3 text-sm text-edubot-muted">
                      <p className="font-medium text-edubot-dark">{event.event_type}</p>
                      <p>{event.error_message || 'Кошумча ката сүрөттөмөсү жок'}</p>
                      <p className="text-xs">Retry count: {event.retry_count} • {formatDateTime(event.created_at)}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="Платформа жөндөөлөрү"
            description="Tenant үчүн демейки тилди, валютаны, колдоо каналын жана платформалык эскертмелерди жаңыртыңыз."
          />
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <SkeletonCard showHeader lines={4} />
          ) : settings ? (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Демейки тил"
                  value={settingsForm.defaultLanguage || ''}
                  onChange={(e) => onSettingsFormChange({ ...settingsForm, defaultLanguage: e.target.value })}
                  placeholder="ky"
                />
                <Input
                  label="Убакыт алкагы"
                  value={settingsForm.timezone || ''}
                  onChange={(e) => onSettingsFormChange({ ...settingsForm, timezone: e.target.value })}
                  placeholder="Asia/Bishkek"
                />
                <Input
                  label="Валюта"
                  value={settingsForm.currency || ''}
                  onChange={(e) => onSettingsFormChange({ ...settingsForm, currency: e.target.value })}
                  placeholder="KGS"
                />
                <Input
                  label="Колдоо email"
                  type="email"
                  value={settingsForm.supportEmail || ''}
                  onChange={(e) => onSettingsFormChange({ ...settingsForm, supportEmail: e.target.value })}
                  placeholder="support@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-edubot-dark">
                  Платформа эскертмеси
                </label>
                <textarea
                  value={settingsForm.metadata?.platformNotes || ''}
                  onChange={(e) =>
                    onSettingsFormChange({
                      ...settingsForm,
                      metadata: { ...settingsForm.metadata, platformNotes: e.target.value },
                    })
                  }
                  className="dashboard-field min-h-[112px] resize-y"
                  rows={3}
                  placeholder="Платформа админдары үчүн эскертмелер..."
                />
              </div>

              <div className="border-t border-edubot-line pt-6">
                <h3 className="mb-4 text-base font-semibold text-edubot-dark">Модулдар</h3>
                {enabledModuleKeys.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {enabledModuleKeys.map((module) => (
                      <Badge key={module} variant="success">
                        {module}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-edubot-muted">Модулдар жок</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={settingsSaving}>
                  {settingsSaving ? 'Сактоо...' : 'Сактоо'}
                </Button>
              </div>
            </form>
          ) : (
            <EmptyState icon={Settings} title="Жөндөөлөр табылган жок" description="Жөндөөлөр жок." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ky-KG', { dateStyle: 'short', timeStyle: 'short' });
}
