import type { TenantDomain } from '../tenantDomainsApi';
import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { SectionIntro } from '../../../shared/components/SectionIntro';
import { TenantDataTable } from './TenantDataTable';
import { TenantSectionState } from './TenantSectionState';

interface TenantDomainsTabProps {
  domainsLoading: boolean;
  domains: TenantDomain[];
  onCreateDomain: () => void;
  renderDomainTypeBadge: (type: string) => React.ReactNode;
  renderDomainStatusBadge: (status: string) => React.ReactNode;
  renderSuccessBadge: (label: string) => React.ReactNode;
  domainActionLoading: string | null;
  onSetPrimary: (domainId: string) => void;
  onUpdateDomainStatus: (domainId: string, newStatus: 'active' | 'pending' | 'failed' | 'disabled') => void;
}

export function TenantDomainsTab({
  domainsLoading,
  domains,
  onCreateDomain,
  renderDomainTypeBadge,
  renderDomainStatusBadge,
  renderSuccessBadge,
  domainActionLoading,
  onSetPrimary,
  onUpdateDomainStatus,
}: TenantDomainsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="Тенант домендери"
            description="Негизги жана кошумча домендерди, алардын текшерүү абалын жана платформалык багыттоосун башкарыңыз."
            actions={(
              <Button onClick={onCreateDomain}>
                Домен кошуу
              </Button>
            )}
          />
        </CardHeader>
        <CardContent>
          {domainsLoading ? (
            <TenantSectionState message="Жүктөлүүдө..." />
          ) : domains.length === 0 ? (
            <TenantSectionState message="Домендер жок" />
          ) : (
            <TenantDataTable
              headers={['Домен', 'Түрү', 'Статус', 'Негизги', 'Текшерилген', 'Түзүлгөн күнү', 'Аракеттер']}
            >
              {domains.map((domain) => (
                <tr key={domain.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-edubot-dark">{domain.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderDomainTypeBadge(domain.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderDomainStatusBadge(domain.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {domain.isPrimary ? renderSuccessBadge('Негизги') : <span className="text-sm text-edubot-muted">Жок</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {domain.isVerified ? renderSuccessBadge('Текшерилген') : <span className="text-sm text-edubot-muted">Текшерилбеген</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-edubot-muted">
                    {new Date(domain.createdAt).toLocaleDateString('ky-KG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!domain.isPrimary && domain.status === 'active' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSetPrimary(domain.id.toString())}
                          disabled={domainActionLoading === domain.id.toString()}
                        >
                          {domainActionLoading === domain.id.toString() ? 'Күтүүдө...' : 'Негизги кылуу'}
                        </Button>
                      )}
                      {domain.status === 'active' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateDomainStatus(domain.id.toString(), 'disabled')}
                          disabled={domainActionLoading === domain.id.toString()}
                        >
                          {domainActionLoading === domain.id.toString() ? 'Күтүүдө...' : 'Өчүрүү'}
                        </Button>
                      )}
                      {domain.status === 'disabled' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateDomainStatus(domain.id.toString(), 'active')}
                          disabled={domainActionLoading === domain.id.toString()}
                        >
                          {domainActionLoading === domain.id.toString() ? 'Күтүүдө...' : 'Активдештирүү'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </TenantDataTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
