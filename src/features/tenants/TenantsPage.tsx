import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { Card, CardContent } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Table } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { tenantApi, type TenantSummary, type GetTenantsParams } from './tenantApi';

export function TenantsPage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadTenants();
  }, [pagination.page, statusFilter]);

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const params: GetTenantsParams = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await tenantApi.getTenants(params);
      setTenants(response);
      setPagination({
        ...pagination,
        total: response.length,
        totalPages: 1,
      });
    } catch (err: any) {
      setError('Тенанттарды жүктөөдө ката кетти');
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadTenants();
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const columns = [
    { key: 'name', header: 'Компания' },
    { key: 'slug', header: 'Слаг' },
    {
      key: 'domain',
      header: 'Негизги домен',
      render: (value: string | null) => value || 'Жок',
    },
    { key: 'planId', header: 'Тариф ID' },
    {
      key: 'status',
      header: 'Статус',
      render: (value: string) => {
        const variant = value === 'active' ? 'success' : value === 'suspended' ? 'danger' : value === 'archived' ? 'neutral' : 'warning';
        const label = value === 'active' ? 'Активдүү' : value === 'suspended' ? 'Токтотулган' : value === 'archived' ? 'Архивделген' : 'Актив эмес';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Түзүлгөн күнү',
      render: (value: string) => new Date(value).toLocaleDateString('ky-KG'),
    },
    {
      key: 'actions',
      header: 'Аракеттер',
      render: (_: any, row: TenantSummary) => (
        <Link to={`/platform/tenants/${row.id}`}>
          <Button variant="ghost" size="sm">
            Көрүү
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Тенанттар</h1>
        <Link to="/platform/tenants/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Жаңы тенант
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Издөө..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Бардык статус</option>
              <option value="active">Активдүү</option>
              <option value="inactive">Актив эмес</option>
              <option value="suspended">Токтотулган</option>
              <option value="archived">Архивделген</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : !tenants || tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Тенанттар табылган жок</div>
          ) : (
            <>
              <Table columns={columns} data={tenants} />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Жалпы: {pagination.total} тенант
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-700">
                      Бет {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
