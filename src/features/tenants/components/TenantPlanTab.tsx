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
  return (
    <div className="space-y-6">
      <Card className="app-surface">
        <CardHeader>
          <SectionIntro title="Азыркы тариф" />
        </CardHeader>
        <CardContent>
          {tenant.plan?.id ? (
            <div className="text-sm text-edubot-ink">
              <span className="font-medium">Тариф:</span> {tenant.plan.name} ({tenant.plan.code})
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
