import type { FormEvent, ReactNode } from 'react';
import type { Tenant, UpdateTenantData } from '../tenantApi';
import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { SectionIntro } from '../../../shared/components/SectionIntro';

interface TenantOverviewTabProps {
  tenant: Tenant;
  isEditing: boolean;
  editForm: UpdateTenantData;
  onEditFormChange: (next: UpdateTenantData) => void;
  onEditSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  loading: boolean;
  statusLoading: boolean;
  onStatusChange: (status: Tenant['status']) => void;
  statusBadge: ReactNode;
  infoRowClasses: string;
}

export function TenantOverviewTab({
  tenant,
  isEditing,
  editForm,
  onEditFormChange,
  onEditSubmit,
  onCancelEdit,
  loading,
  statusLoading,
  onStatusChange,
  statusBadge,
  infoRowClasses,
}: TenantOverviewTabProps) {
  if (isEditing) {
    return (
      <div className="space-y-6">
        <Card className="app-surface">
          <CardHeader>
            <SectionIntro title="Тенантты оңдоо" />
          </CardHeader>
          <CardContent>
            <form onSubmit={onEditSubmit} className="space-y-4">
              <Input
                label="Компаниянын аталышы"
                value={editForm.name || ''}
                onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                required
              />
              <Input
                label="Слаг"
                value={editForm.slug || ''}
                onChange={(e) => onEditFormChange({ ...editForm, slug: e.target.value.toLowerCase() })}
                required
              />
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={onCancelEdit} disabled={loading}>
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="app-surface">
          <CardHeader>
            <SectionIntro title="Жалпы маалымат" />
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-edubot-muted">Компания</dt>
                <dd className={infoRowClasses}>{tenant.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-edubot-muted">Слаг</dt>
                <dd className={infoRowClasses}>{tenant.slug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-edubot-muted">Негизги домен</dt>
                <dd className={infoRowClasses}>{tenant.primaryDomain || 'Жок'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-edubot-muted">Статус</dt>
                <dd className="mt-1">{statusBadge}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-edubot-muted">Түзүлгөн күнү</dt>
                <dd className={infoRowClasses}>{new Date(tenant.createdAt).toLocaleDateString('ky-KG')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-edubot-muted">Жаңыртылган күнү</dt>
                <dd className={infoRowClasses}>{new Date(tenant.updatedAt).toLocaleDateString('ky-KG')}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="app-surface">
          <CardHeader>
            <SectionIntro title="Тариф маалыматы" />
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-edubot-muted">Азыркы тариф</dt>
                <dd className={infoRowClasses}>{tenant.plan?.name || tenant.plan?.code || 'Жок'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="app-surface lg:col-span-2">
          <CardHeader>
            <SectionIntro
              title="Статусту өзгөртүү"
              description="Tenant'тин иш абалын дароо өзгөртүп, платформадагы жеткиликтүүлүгүн жаңыртыңыз."
            />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={tenant.status === 'active' ? 'primary' : 'secondary'}
                onClick={() => onStatusChange('active')}
                disabled={statusLoading}
              >
                Активдүү
              </Button>
              <Button
                variant={tenant.status === 'inactive' ? 'primary' : 'secondary'}
                onClick={() => onStatusChange('inactive')}
                disabled={statusLoading}
              >
                Актив эмес
              </Button>
              <Button
                variant={tenant.status === 'suspended' ? 'primary' : 'secondary'}
                onClick={() => onStatusChange('suspended')}
                disabled={statusLoading}
              >
                Токтотулган
              </Button>
              <Button
                variant={tenant.status === 'archived' ? 'primary' : 'secondary'}
                onClick={() => onStatusChange('archived')}
                disabled={statusLoading}
              >
                Архивделген
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
