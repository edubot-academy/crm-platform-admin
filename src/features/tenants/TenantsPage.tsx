import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { Card, CardContent } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Table } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { Plus, Search, ChevronLeft, ChevronRight, Users, ChevronDown, Filter, LayoutGrid, List, MoreVertical, Eye } from 'lucide-react';
import { tenantApi, type TenantSummary, type GetTenantsParams } from './tenantApi';

export function TenantsPage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [actionDropdownOpen, setActionDropdownOpen] = useState<number | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    createdAtFrom: '',
    createdAtTo: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const buildTenantParams = (): GetTenantsParams => {
    const params: GetTenantsParams = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (advancedFilters.createdAtFrom) params.createdAtFrom = advancedFilters.createdAtFrom;
    if (advancedFilters.createdAtTo) params.createdAtTo = advancedFilters.createdAtTo;

    return params;
  };

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tenantApi.getTenants(buildTenantParams());
      setTenants(response.items);
      setPagination((current) => ({
        ...current,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      setError(isAxiosError(error) ? error.response?.data?.message || 'Тенанттарды жүктөөдө ката кетти' : 'Тенанттарды жүктөөдө ката кетти');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError('');
        try {
          const params: GetTenantsParams = {
            page: pagination.page,
            limit: pagination.limit,
          };

          if (search) params.search = search;
          if (statusFilter) params.status = statusFilter;
          if (advancedFilters.createdAtFrom) params.createdAtFrom = advancedFilters.createdAtFrom;
          if (advancedFilters.createdAtTo) params.createdAtTo = advancedFilters.createdAtTo;

          const response = await tenantApi.getTenants(params);
          setTenants(response.items);
          setPagination((current) => ({
            ...current,
            total: response.total,
            totalPages: response.totalPages,
          }));
        } catch (error) {
          setError(isAxiosError(error) ? error.response?.data?.message || 'Тенанттарды жүктөөдө ката кетти' : 'Тенанттарды жүктөөдө ката кетти');
        } finally {
          setLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pagination.page, pagination.limit, search, statusFilter, advancedFilters.createdAtFrom, advancedFilters.createdAtTo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((current) => ({ ...current, page: newPage }));
  };

  const columns = [
    { key: 'name', header: 'Компания' },
    { key: 'slug', header: 'Слаг' },
    {
      key: 'primaryDomain',
      header: 'Негизги домен',
      render: (value: string | null) => value || 'Жок',
    },
    {
      key: 'plan',
      header: 'Тариф',
      render: (value: TenantSummary['plan']) => value?.name || value?.code || 'Жок',
    },
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
      render: (_value: unknown, row: TenantSummary) => (
        <div className="relative">
          <button
            onClick={() => setActionDropdownOpen(actionDropdownOpen === row.id ? null : row.id)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Көбүрөөк аракеттер"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
          {actionDropdownOpen === row.id && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              <Link
                to={`/platform/tenants/${row.id}`}
                onClick={() => setActionDropdownOpen(null)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Көрүү
              </Link>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Тенанттар</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={`rounded-r-none ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
              leftIcon={List}
              iconOnly
              aria-label="Таблица көрүнүшү"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('card')}
              className={`rounded-l-none ${viewMode === 'card' ? 'bg-gray-100' : ''}`}
              leftIcon={LayoutGrid}
              iconOnly
              aria-label="Карточка көрүнүшү"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Link to="/platform/tenants/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Жаңы тенант
            </Button>
          </Link>
        </div>
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
            <Button
              variant="ghost"
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              leftIcon={Filter}
            >
              Өркүнчөү
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${filterPanelOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filter Panel */}
          {filterPanelOpen && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Түзүлгөн күнү (башы)</label>
                  <Input
                    type="date"
                    value={advancedFilters.createdAtFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdAtFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Түзүлгөн күнү (аягы)</label>
                  <Input
                    type="date"
                    value={advancedFilters.createdAtTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdAtTo: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAdvancedFilters({ createdAtFrom: '', createdAtTo: '' });
                    setPagination((current) => ({ ...current, page: 1 }));
                    setFilterPanelOpen(false);
                    void loadTenants();
                  }}
                >
                  Тазалоо
                </Button>
                <Button
                  onClick={() => {
                    setPagination((current) => ({ ...current, page: 1 }));
                    setFilterPanelOpen(false);
                    void loadTenants();
                  }}
                >
                  Колдонуу
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : !tenants || tenants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Тенанттар табылган жок"
              description="Тенанттарды изделүү үчүн издөө параметрлерин өзгөртүңүз жаңы тенант түзүңүз"
              actionText="Жаңы тенант"
              onAction={() => window.location.href = '/platform/tenants/new'}
            />
          ) : (
            <>
              {viewMode === 'table' ? (
                <Table
                  columns={columns}
                  data={tenants}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tenants.map((tenant) => (
                    <Card key={tenant.id} hoverable>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                            <p className="text-sm text-gray-500">{tenant.slug}</p>
                          </div>
                          <Badge
                            variant={
                              tenant.status === 'active'
                                ? 'success'
                                : tenant.status === 'suspended'
                                  ? 'danger'
                                  : tenant.status === 'archived'
                                    ? 'neutral'
                                    : 'warning'
                            }
                          >
                            {tenant.status === 'active'
                              ? 'Активдүү'
                              : tenant.status === 'suspended'
                                ? 'Токтотулган'
                                : tenant.status === 'archived'
                                  ? 'Архивделген'
                                  : 'Актив эмес'}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Домен:</span>
                            <span className="text-gray-900">{tenant.primaryDomain || 'Жок'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Тариф:</span>
                            <span className="text-gray-900">{tenant.plan?.name || tenant.plan?.code || 'Жок'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Түзүлгөн:</span>
                            <span className="text-gray-900">
                              {new Date(tenant.createdAt).toLocaleDateString('ky-KG')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Link to={`/platform/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="sm" className="w-full">
                              Көрүү
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-4">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
