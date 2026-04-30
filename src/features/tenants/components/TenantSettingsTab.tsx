import type { FormEvent } from 'react';
import type { TenantConfig, UpdateTenantConfigDto } from '../tenantSettingsApi';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Input } from '../../../shared/components/Input';
import { SectionIntro } from '../../../shared/components/SectionIntro';
import { Settings } from 'lucide-react';
import { SkeletonCard } from '../../../shared/components/SkeletonCard';

interface TenantSettingsTabProps {
  settingsLoading: boolean;
  settings: TenantConfig | null;
  settingsForm: UpdateTenantConfigDto;
  onSettingsFormChange: (next: UpdateTenantConfigDto) => void;
  enabledModuleKeys: string[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  settingsSaving: boolean;
}

export function TenantSettingsTab({
  settingsLoading,
  settings,
  settingsForm,
  onSettingsFormChange,
  enabledModuleKeys,
  onSubmit,
  settingsSaving,
}: TenantSettingsTabProps) {
  return (
    <div className="space-y-6">
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
