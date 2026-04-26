import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Building2, Users, Flag, TrendingUp, Calendar, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function PlatformDashboardPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // TODO: Fetch real data from API
  const stats = {
    totalTenants: 12,
    activeTenants: 8,
    platformUsers: 5,
    activeFeatures: 24,
  };

  const tenantTrendData = [
    { month: 'Янв', tenants: 8 },
    { month: 'Фев', tenants: 9 },
    { month: 'Март', tenants: 10 },
    { month: 'Апр', tenants: 11 },
    { month: 'Май', tenants: 12 },
  ];

  const comparisonData = [
    { name: 'Активдүү', value: 8 },
    { name: 'Активсиз', value: 4 },
  ];

  const sparklineData = {
    totalTenants: [8, 9, 10, 11, 12],
    activeTenants: [6, 7, 7, 8, 8],
    platformUsers: [4, 4, 5, 5, 5],
    activeFeatures: [20, 21, 22, 23, 24],
  };

  const handleExport = () => {
    // TODO: Implement actual export functionality
    const exportData = {
      stats,
      tenantTrendData,
      comparisonData,
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
          value={stats.totalTenants}
          icon={Building2}
          color="blue"
          sparkline={sparklineData.totalTenants}
        />
        <StatCard
          title="Активдүү тенанттар"
          value={stats.activeTenants}
          icon={TrendingUp}
          color="green"
          sparkline={sparklineData.activeTenants}
        />
        <StatCard
          title="Платформа колдонуучулары"
          value={stats.platformUsers}
          icon={Users}
          color="purple"
          sparkline={sparklineData.platformUsers}
        />
        <StatCard
          title="Активдүү функциялар"
          value={stats.activeFeatures}
          icon={Flag}
          color="orange"
          sparkline={sparklineData.activeFeatures}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Тенанттардын өсүүсү</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tenantTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tenants"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Тенанттардын абалы</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  sparkline?: number[];
}

function StatCard({ title, value, icon: Icon, color, sparkline }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const strokeColors = {
    blue: '#2563eb',
    green: '#16a34a',
    purple: '#9333ea',
    orange: '#ea580c',
  };

  const sparklineChartData = sparkline ? sparkline.map((val, idx) => ({ idx, val })) : [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {sparkline && sparkline.length > 0 && (
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={sparklineChartData}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColors[color]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={strokeColors[color]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={strokeColors[color]}
                strokeWidth={2}
                fill={`url(#gradient-${color})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
