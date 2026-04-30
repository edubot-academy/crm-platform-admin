import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { PageHeader } from '../../shared/components/PageHeader';
import { Switch } from '../../shared/components/Switch';

export function PlatformSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Жөндөөлөр"
        description="Платформанын жалпы аталышын, колдоо байланыштарын, коопсуздук саясаттарын жана почта жөндөөлөрүн бир жерден башкарыңыз."
      />

      <div className="space-y-6">
        <Card className="app-surface">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Жалпы жөндөөлөр</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Платформа аталышы"
                defaultValue="Edubot CRM"
              />
              <Input
                label="Колдоо email"
                type="email"
                defaultValue="support@edubot.it.com"
              />
              <Button>Сактоо</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="app-surface">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Коопсуздук</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-edubot-line bg-white/75 p-4">
                <div>
                  <h3 className="font-medium text-edubot-dark">Эки факторлуу ырастоо милдеттүү</h3>
                  <p className="mt-1 text-sm text-edubot-muted">
                    Бардык суперадминдер үчүн эки факторлуу ырастоо талап кылынат
                  </p>
                </div>
                <Switch checked={false} ariaLabel="Бул жөндөө өчүрүлгөн" disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="app-surface">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Почта жөндөөлөрү</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="SMTP хост"
                placeholder="smtp.example.com"
              />
              <Input
                label="SMTP порт"
                type="number"
                placeholder="587"
              />
              <Input
                label="SMTP колдонуучу"
                placeholder="user@example.com"
              />
              <Input
                label="SMTP сырсөз"
                type="password"
                placeholder="••••••••"
              />
              <Button>Сактоо</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
