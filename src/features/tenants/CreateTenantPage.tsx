import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { PageHeader } from '../../shared/components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import { TenantOnboardForm } from './components/TenantOnboardForm';

export function CreateTenantPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Жаңы тенант"
        description="Компанияны, биринчи администраторду жана баштапкы коммерциялык орнотууларды бир агымда түзүңүз."
        actions={(
          <Button variant="ghost" onClick={() => navigate('/platform/tenants')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Артка
          </Button>
        )}
      />
      <TenantOnboardForm />
    </div>
  );
}
