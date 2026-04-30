import { useState, useEffect, useMemo } from 'react';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Card, CardContent } from '../../shared/components/Card';
import { FilterBar, FilterBarItem } from '../../shared/components/FilterBar';
import { Input } from '../../shared/components/Input';
import { PageHeader } from '../../shared/components/PageHeader';
import { Select } from '../../shared/components/Select';
import { Table } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { FormModal } from '../../shared/components/FormModal';
import { Plus, Search, ChevronLeft, ChevronRight, Users, ChevronDown, Filter, LayoutGrid, List, MoreVertical, Eye } from 'lucide-react';
import { tenantApi, type TenantSummary, type GetTenantsParams } from './tenantApi';
import { TenantOnboardForm } from './components/TenantOnboardForm';

export function TenantsPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [actionDropdownOpen, setActionDropdownOpen] = useState<number | null>(null);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    createdAtFrom: '',
    createdAtTo: '',
  });
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState({
    createdAtFrom: '',
    createdAtTo: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const tenantParams = useMemo(() => {
    const params: GetTenantsParams = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (appliedSearch) params.search = appliedSearch;
    if (appliedStatusFilter) params.status = appliedStatusFilter;
    if (appliedAdvancedFilters.createdAtFrom) params.createdAtFrom = appliedAdvancedFilters.createdAtFrom;
    if (appliedAdvancedFilters.createdAtTo) params.createdAtTo = appliedAdvancedFilters.createdAtTo;

    return params;
  }, [pagination.page, pagination.limit, appliedSearch, appliedStatusFilter, appliedAdvancedFilters.createdAtFrom, appliedAdvancedFilters.createdAtTo]);

  const loadTenants = async (params: GetTenantsParams = tenantParams) => {
    setLoading(true);
    setError('');
    try {
      const response = await tenantApi.getTenants(params);
      setTenants(response.items);
      setPagination((current) => ({
        ...current,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      setError(isAxiosError(error) ? error.response?.data?.message || 'Уюмдарды жүктөөдө ката кетти' : 'Уюмдарды жүктөөдө ката кетти');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const response = await tenantApi.getTenants(tenantParams);
        setTenants(response.items);
        setPagination((current) => ({
          ...current,
          total: response.total,
          totalPages: response.totalPages,
        }));
      } catch (error) {
        setError(isAxiosError(error) ? error.response?.data?.message || 'Уюмдарды жүктөөдө ката кетти' : 'Уюмдарды жүктөөдө ката кетти');
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setAppliedStatusFilter(statusFilter);
    setAppliedAdvancedFilters(advancedFilters);
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
      render: (value: unknown) => (value as string | null) || 'Жок',
    },
    {
      key: 'plan',
      header: 'Тариф',
      render: (value: unknown) => {
        const plan = value as TenantSummary['plan'];
        return plan?.name || plan?.code || 'Жок';
      },
    },
    {
      key: 'status',
      header: 'Статус',
      render: (value: unknown) => {
        const status = value as string;
        const variant = status === 'active' ? 'success' : status === 'suspended' ? 'danger' : status === 'archived' ? 'neutral' : 'warning';
        const label = status === 'active' ? 'Активдүү' : status === 'suspended' ? 'Токтотулган' : status === 'archived' ? 'Архивделген' : 'Актив эмес';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Түзүлгөн күнү',
      render: (value: unknown) => new Date(value as string).toLocaleDateString('ky-KG'),
    },
    {
      key: 'actions',
      header: 'Аракеттер',
      render: (_value: unknown, row: TenantSummary) => (
        <div className="relative" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <button
            type="button"
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
      <PageHeader
        title="Уюмдар"
        description="Уюмдарды издөө, статусу боюнча чыпкалоо жана толук профилине тез өтүү үчүн борбордук тизме."
        actions={(
          <>
          <div className="flex items-center rounded-2xl border border-edubot-line bg-white/80 p-1 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-edubot-orange/10 text-edubot-orange' : ''}
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
              className={viewMode === 'card' ? 'bg-edubot-orange/10 text-edubot-orange' : ''}
              leftIcon={LayoutGrid}
              iconOnly
              aria-label="Карточка көрүнүшү"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setShowCreateTenantModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Жаңы уюм
          </Button>
          </>
        )}
      />

      <FormModal
        isOpen={showCreateTenantModal}
        title="Жаңы уюм"
        description="Компанияны, администраторду жана баштапкы коммерциялык орнотууларды бир агымда түзүңүз."
        maxWidthClassName="max-w-4xl"
        onClose={() => setShowCreateTenantModal(false)}
      >
        <TenantOnboardForm
          variant="modal"
          onCancel={() => setShowCreateTenantModal(false)}
          onCreated={() => {
            void loadTenants(tenantParams);
          }}
        />
      </FormModal>

      <Card className="app-surface">
        <CardContent className="p-6">

          {/* Search and Filter */}
          <FilterBar className="lg:flex-row">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-edubot-muted" />
                <Input
                  placeholder="Издөө..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <FilterBarItem widthClassName="w-full lg:w-56">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: '', label: 'Бардык статус' },
                  { value: 'active', label: 'Активдүү' },
                  { value: 'inactive', label: 'Актив эмес' },
                  { value: 'suspended', label: 'Токтотулган' },
                  { value: 'archived', label: 'Архивделген' },
                ]}
                placeholder="Бардык статус"
              />
            </FilterBarItem>
            <Button
              variant="ghost"
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              leftIcon={Filter}
            >
              Кеңири чыпкалар
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${filterPanelOpen ? 'rotate-180' : ''}`} />
            </Button>
          </FilterBar>

          {/* Advanced Filter Panel */}
          {filterPanelOpen && (
            <div className="mb-6 rounded-3xl border border-edubot-line bg-edubot-surfaceAlt/75 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-edubot-dark">Түзүлгөн күнү (башы)</label>
                  <Input
                    type="date"
                    value={advancedFilters.createdAtFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdAtFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-edubot-dark">Түзүлгөн күнү (аягы)</label>
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
                    const emptyFilters = { createdAtFrom: '', createdAtTo: '' };
                    setSearch('');
                    setStatusFilter('');
                    setAdvancedFilters(emptyFilters);
                    setAppliedSearch('');
                    setAppliedStatusFilter('');
                    setAppliedAdvancedFilters(emptyFilters);
                    setPagination((current) => ({ ...current, page: 1 }));
                    setFilterPanelOpen(false);
                  }}
                >
                  Тазалоо
                </Button>
                <Button
                  onClick={() => {
                    setAppliedSearch(search);
                    setAppliedStatusFilter(statusFilter);
                    setAppliedAdvancedFilters(advancedFilters);
                    setPagination((current) => ({ ...current, page: 1 }));
                    setFilterPanelOpen(false);
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
            <Alert variant="error">{error}</Alert>
          ) : !tenants || tenants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Уюмдар табылган жок"
              description="Издөө шарттарын өзгөртүңүз же жаңы уюм түзүңүз."
              actionText="Жаңы уюм"
              onAction={() => setShowCreateTenantModal(true)}
            />
          ) : (
            <>
              {viewMode === 'table' ? (
                <Table
                  columns={columns}
                  data={tenants}
                  rowKey="id"
                  onRowClick={(row) => navigate(`/platform/tenants/${row.id}`)}
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
                  Жалпы: {pagination.total} уюм
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
