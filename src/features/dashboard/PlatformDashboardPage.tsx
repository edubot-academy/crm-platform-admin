import { useState, useEffect, useCallback } from 'react';
import type { ComponentType } from 'react';
import { isAxiosError } from 'axios';
import { Alert } from '../../shared/components/Alert';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import { Building2, Users, Flag, TrendingUp, Calendar, Download } from 'lucide-react';
import { dashboardApi, type PlatformOverviewResponse } from '../../shared/api/dashboardApi';

type StatTone = 'primary' | 'success' | 'teal' | 'warning';

export function PlatformDashboardPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<PlatformOverviewResponse | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const overview = await dashboardApi.getPlatformOverview();
      setData(overview);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Маалыматты алуу мүмкүн болгон жок' : 'Маалыматты алуу мүмкүн болгон жок');
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOverview();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOverview]);

  const handleExport = () => {
    if (!data) return;
    const exportData = {
      ...data,
      dateRange,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-edubot-muted">Жүктөлүүдө...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState title="Маалымат жок" description="Панелде көрсөтө турган жыйынтык табылган жок." />
    );
  }

  return (
    <div>
      <PageHeader
        title="Жалпы көрүнүш"
        description="Платформанын негизги көрсөткүчтөрүн, уюмдардын абалын жана акыркы админ аракеттерин бир экрандан көзөмөлдөңүз."
        actions={(
          <>
          <div className="flex items-center space-x-2 rounded-2xl border border-edubot-line bg-white/90 px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-edubot-muted" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="border-0 bg-transparent text-sm text-edubot-ink focus:outline-none focus:ring-0"
            />
            <span className="text-edubot-muted">-</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="border-0 bg-transparent text-sm text-edubot-ink focus:outline-none focus:ring-0"
            />
          </div>
          <Button onClick={handleExport} leftIcon={Download}>
            Экспорт
          </Button>
          </>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Жалпы уюмдар"
          value={data.tenants.total}
          icon={Building2}
          tone="primary"
        />
        <StatCard
          title="Активдүү уюмдар"
          value={data.tenants.active}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="Платформа админдери"
          value={data.platformUsers.total}
          icon={Users}
          tone="teal"
        />
        <StatCard
          title="Активдүү тарифтер"
          value={data.plans.active}
          icon={Flag}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="app-surface">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Уюмдардын абалы</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Активдүү</span>
                <span className="text-sm font-medium text-edubot-dark">{data.tenants.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Актив эмес</span>
                <span className="text-sm font-medium text-edubot-dark">{data.tenants.inactive}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Токтотулган</span>
                <span className="text-sm font-medium text-edubot-dark">{data.tenants.suspended}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Архивделген</span>
                <span className="text-sm font-medium text-edubot-dark">{data.tenants.archived}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="app-surface">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Функционалдык белгилер</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Жалпы</span>
                <span className="text-sm font-medium text-edubot-dark">{data.featureFlags.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Активдүү</span>
                <span className="text-sm font-medium text-green-600">{data.featureFlags.enabled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Өчүрүлгөн</span>
                <span className="text-sm font-medium text-edubot-muted">{data.featureFlags.disabled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="app-surface">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Системалык абал</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">API статусу</span>
                <span className="text-sm font-medium text-amber-600">Текшерилген эмес</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-edubot-muted">Маалымат базасы</span>
                <span className="text-sm font-medium text-amber-600">Текшерилген эмес</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="app-surface">
          <CardHeader>
            <h2 className="text-lg font-semibold text-edubot-dark">Акыркы аракеттер</h2>
          </CardHeader>
          <CardContent>
            {data.auditLogs.recent.length === 0 ? (
              <div className="text-sm text-edubot-muted">Аракеттер жок</div>
            ) : (
              <div className="space-y-2">
                {data.auditLogs.recent.map((log) => (
                  <div key={log.id} className="text-sm">
                    <div className="font-medium text-edubot-dark">{log.title}</div>
                    <div className="text-edubot-muted">
                      {log.actorEmail || 'Белгисиз'} • {new Date(log.createdAt).toLocaleDateString('ky-KG')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  tone: StatTone;
}

function StatCard({ title, value, icon: Icon, tone }: StatCardProps) {
  const toneClasses = {
    primary: 'bg-edubot-orange/12 text-edubot-orange ring-1 ring-edubot-orange/15',
    success: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
    teal: 'bg-edubot-teal/10 text-edubot-teal ring-1 ring-edubot-teal/15',
    warning: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  };

  return (
    <Card className="app-surface" hoverable>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-edubot-muted">{title}</p>
            <p className="mt-2 text-3xl font-bold text-edubot-dark">{value}</p>
          </div>
          <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
