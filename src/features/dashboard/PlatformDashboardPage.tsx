import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Building2, Users, Flag, TrendingUp, Calendar, Download } from 'lucide-react';
import { dashboardApi, type PlatformOverviewResponse } from '../../shared/api/dashboardApi';

export function PlatformDashboardPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<PlatformOverviewResponse | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const overview = await dashboardApi.getPlatformOverview();
      setData(overview);
    } catch (err: any) {
      setError('Маалыматты алуу мүмкүн болгон жок');
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-gray-500">Жүктөлүүдө...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Маалымат жок</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Башкы бет</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="text-sm text-gray-700 border-0 focus:outline-none focus:ring-0"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="text-sm text-gray-700 border-0 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Экспорт</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Жалпы тенанттар"
          value={data.tenants.total}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Активдүү тенанттар"
          value={data.tenants.active}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Платформа колдонуучулары"
          value={data.platformUsers.total}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Активдүү тарифтер"
          value={data.plans.active}
          icon={Flag}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Тенанттардын абалы</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Активдүү</span>
                <span className="text-sm font-medium text-gray-900">{data.tenants.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Актив эмес</span>
                <span className="text-sm font-medium text-gray-900">{data.tenants.inactive}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Токтотулган</span>
                <span className="text-sm font-medium text-gray-900">{data.tenants.suspended}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Архивделген</span>
                <span className="text-sm font-medium text-gray-900">{data.tenants.archived}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Функционалдык белгилер</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Жалпы</span>
                <span className="text-sm font-medium text-gray-900">{data.featureFlags.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Активдүү</span>
                <span className="text-sm font-medium text-green-600">{data.featureFlags.enabled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Өчүрүлгөн</span>
                <span className="text-sm font-medium text-gray-500">{data.featureFlags.disabled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Системалык абал</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API статусу</span>
                <span className="text-sm text-green-600 font-medium">Активдүү</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">База данных</span>
                <span className="text-sm text-green-600 font-medium">Активдүү</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Акыркы аракеттер</h2>
          </CardHeader>
          <CardContent>
            {data.auditLogs.recent.length === 0 ? (
              <div className="text-sm text-gray-500">Аракеттер жок</div>
            ) : (
              <div className="space-y-2">
                {data.auditLogs.recent.map((log) => (
                  <div key={log.id} className="text-sm">
                    <div className="font-medium text-gray-900">{log.title}</div>
                    <div className="text-gray-500">
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
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
