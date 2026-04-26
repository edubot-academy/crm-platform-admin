import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';

export function PlatformSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Жөндөөлөр</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Жалпы жөндөөлөр</h2>
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

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Коопсуздук</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">2FA талап кылынат</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Бардык суперадминдар үчүн эки фактордуу аутентификация
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors" aria-label="Бул жөндөө өчүрүлгөн">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Мейл конфигурациясы</h2>
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
                label="SMTP пароль"
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
