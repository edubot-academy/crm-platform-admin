import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Card, CardContent } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Table } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { FilterBar, FilterBarItem } from '../../shared/components/FilterBar';
import { PageHeader } from '../../shared/components/PageHeader';
import { Search, MessageSquare } from 'lucide-react';
import { demoRequestsApi, type DemoRequest, type DemoRequestStatus } from './demoRequestsApi';

const STATUS_OPTIONS: { value: DemoRequestStatus | ''; label: string }[] = [
  { value: '', label: 'Баары' },
  { value: 'new', label: 'Жаңы' },
  { value: 'contacted', label: 'Байланышылган' },
  { value: 'demo_scheduled', label: 'Демо белгиленген' },
  { value: 'closed', label: 'Жабык' },
  { value: 'spam', label: 'Спам' },
];

const STATUS_LABELS: Record<DemoRequestStatus, string> = {
  new: 'Жаңы',
  contacted: 'Байланышылган',
  demo_scheduled: 'Демо белгиленген',
  closed: 'Жабык',
  spam: 'Спам',
};

const STATUS_VARIANTS: Record<DemoRequestStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
  new: 'success',
  contacted: 'warning',
  demo_scheduled: 'warning',
  closed: 'neutral',
  spam: 'danger',
};

export function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DemoRequestStatus | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await demoRequestsApi.getDemoRequests({
        page,
        limit,
        status: statusFilter || undefined,
        search: submittedSearch || undefined,
      });
      setRequests(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Демо сурамдарын жүктөөдө ката кетти' : 'Демо сурамдарын жүктөөдө ката кетти');
      console.error('Failed to load demo requests:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, submittedSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRequests]);

  const handleSearch = () => {
    setSubmittedSearch(search);
    if (page !== 1) {
      setPage(1);
      return;
    }

    void loadRequests();
  };

  const handleStatusChange = async (id: string, newStatus: DemoRequestStatus) => {
    try {
      await demoRequestsApi.updateDemoRequestStatus(id, { status: newStatus });
      toast.success('Статус ийгиликтүү өзгөртүлдү');
      void loadRequests();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Статусту өзгөртүүдө ката кетти');
    }
  };

  const columns = [
    { key: 'name', header: 'Аты-жөнү' },
    { key: 'companyName', header: 'Компания' },
    { key: 'phone', header: 'Телефон' },
    {
      key: 'email',
      header: 'Email',
      render: (value: unknown) => (value as string | null) || '—',
    },
    {
      key: 'status',
      header: 'Статус',
      render: (value: unknown) => {
        const status = value as DemoRequestStatus;
        return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
      },
    },
    {
      key: 'source',
      header: 'Булак',
      render: (value: unknown) => ((value as string) === 'crm_landing' ? 'Сайт' : (value as string)),
    },
    {
      key: 'createdAt',
      header: 'Түзүлгөн күнү',
      render: (value: unknown) => new Date(value as string).toLocaleDateString('ky-KG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      key: 'actions',
      header: 'Аракеттер',
      render: (_value: unknown, row: DemoRequest) => (
        <div className="w-44">
          <Select
            value={row.status}
            onChange={(value) => handleStatusChange(row.id, value as DemoRequestStatus)}
            options={STATUS_OPTIONS.filter((opt) => opt.value !== '')}
            placeholder="Статус"
          />
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Демо сурамдар"
        description="Сурамдарды булак, статус жана түшкөн убактысы боюнча көзөмөлдөп, түз эле таблицадан иштетиңиз."
      />

      <Card className="mb-6 app-surface">
        <CardContent className="p-6">
          <FilterBar className="md:gap-4">
            <FilterBarItem grow>
              <Input
                placeholder="Аты, компания, телефон же email боюнча издөө..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </FilterBarItem>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Издөө
            </Button>
            <FilterBarItem widthClassName="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as DemoRequestStatus | '');
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
                placeholder="Баары"
              />
            </FilterBarItem>
          </FilterBar>
        </CardContent>
      </Card>

      <Card className="app-surface">
        <CardContent className="p-6">
          {loading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Демо сурамдары табылган жок"
              description="Демо сурамдары жок. Фильтрлерди өзгөртүп көрүңүз."
            />
          ) : (
            <>
              <Table columns={columns} data={requests} rowKey="id" />
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-edubot-muted">
                    Жалпы: {total} сурам
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Мурунку
                    </Button>
                    <span className="px-3 py-1 text-sm text-edubot-muted">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Кийинки
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
