import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Building2, Users, Flag, TrendingUp } from 'lucide-react';

export function PlatformDashboardPage() {
  // TODO: Fetch real data from API
  const stats = {
    totalTenants: 12,
    activeTenants: 8,
    platformUsers: 5,
    activeFeatures: 24,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Башкы бет</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Жалпы тенанттар"
          value={stats.totalTenants}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Активдүү тенанттар"
          value={stats.activeTenants}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Платформа колдонуучулары"
          value={stats.platformUsers}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Активдүү функциялар"
          value={stats.activeFeatures}
          icon={Flag}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Акыркы тенанттар</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Маалымат жок</p>
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
