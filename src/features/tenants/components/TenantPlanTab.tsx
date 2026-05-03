import type { FormEvent } from 'react';
import type { Plan } from '../../plans/plansApi';
import type { Tenant } from '../tenantApi';
import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { SectionIntro } from '../../../shared/components/SectionIntro';
import { Select } from '../../../shared/components/Select';
import { TenantSectionState } from './TenantSectionState';

interface TenantPlanTabProps {
  tenant: Tenant;
  plans: Plan[];
  plansLoading: boolean;
  selectedPlanId: string;
  onSelectedPlanIdChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  planAssignLoading: boolean;
}

export function TenantPlanTab({
  tenant,
  plans,
  plansLoading,
  selectedPlanId,
  onSelectedPlanIdChange,
  onSubmit,
  planAssignLoading,
}: TenantPlanTabProps) {
  const aiAssistEnabled = tenant.features?.ai_assist_enabled === true;
  const aiDraftsEnabled = tenant.features?.ai_followup_drafts_enabled === true;

  return (
    <div className="space-y-6">
      <Card className="app-surface">
        <CardHeader>
          <SectionIntro title="Азыркы тариф" />
        </CardHeader>
        <CardContent>
          {tenant.plan?.id ? (
            <div className="space-y-3 text-sm text-edubot-ink">
              <div>
                <span className="font-medium">Тариф:</span> {tenant.plan.name} ({tenant.plan.code})
              </div>
              <div className="rounded-2xl border border-edubot-line bg-edubot-surface/70 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted">
                  AI жеткиликтүүлүгү
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">AI жардамчысы:</span>{' '}
                    {aiAssistEnabled ? 'жеткиликтүү' : 'жеткиликтүү эмес'}
                  </div>
                  <div>
                    <span className="font-medium">AI жооп сунушу:</span>{' '}
                    {aiDraftsEnabled ? 'жеткиликтүү' : 'жеткиликтүү эмес'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-edubot-muted">Тариф белгиленген эмес</div>
          )}
        </CardContent>
      </Card>

      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="Тарифти өзгөртүү"
            description="Tenant үчүн жеткиликтүү активдүү тарифтердин бирин тандап, дароо кайра бекитиңиз."
          />
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <TenantSectionState message="Жүктөлүүдө..." />
          ) : plans.length === 0 ? (
            <TenantSectionState message="Активдүү тарифтер жок" />
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Select
                label="Жаңы тариф"
                value={selectedPlanId}
                onChange={onSelectedPlanIdChange}
                options={[
                  { value: '', label: 'Тарифти танданыз' },
                  ...plans.map((plan) => ({
                    value: plan.id,
                    label: `${plan.name} (${plan.code}) - ${plan.monthlyPrice || plan.yearlyPrice ? `${plan.monthlyPrice || plan.yearlyPrice} ${plan.currency}` : 'Баасы жок'}`,
                  })),
                ]}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={planAssignLoading || !selectedPlanId}>
                  {planAssignLoading ? 'Сактоо...' : 'Сактоо'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
