import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../shared/components/Button';
import { Card, CardContent } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Table } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { Search } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<DemoRequestStatus | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadRequests();
  }, [page, statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await demoRequestsApi.getDemoRequests({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setRequests(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError('Демо сурамдарын жүктөөдө ката кетти');
      console.error('Failed to load demo requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadRequests();
  };

  const handleStatusChange = async (id: string, newStatus: DemoRequestStatus) => {
    try {
      await demoRequestsApi.updateDemoRequestStatus(id, { status: newStatus });
      toast.success('Статус ийгиликтүү өзгөртүлдү');
      loadRequests();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Статусту өзгөртүүдө ката кетти');
    }
  };

  const handleRowStatusChange = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    handleStatusChange(id, e.target.value as DemoRequestStatus);
  };

  const columns = [
    { key: 'name', header: 'Аты' },
    { key: 'companyName', header: 'Компания' },
    { key: 'phone', header: 'Телефон' },
    {
      key: 'email',
      header: 'Email',
      render: (value: string | null) => value || '—',
    },
    {
      key: 'status',
      header: 'Статус',
      render: (value: DemoRequestStatus) => (
        <Badge variant={STATUS_VARIANTS[value]}>{STATUS_LABELS[value]}</Badge>
      ),
    },
    {
      key: 'source',
      header: 'Булак',
      render: (value: string) => value === 'crm_landing' ? 'CRM Landing' : value,
    },
    {
      key: 'createdAt',
      header: 'Түзүлгөн күнү',
      render: (value: string) => new Date(value).toLocaleDateString('ky-KG', {
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
      render: (_: any, row: DemoRequest) => (
        <div className="flex gap-2">
          <select
            value={row.status}
            onChange={(e) => handleRowStatusChange(row.id, e)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {STATUS_OPTIONS.filter(opt => opt.value !== '').map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CRM Демо Сурамдары</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Аты, компания, телефон же email боюнча издөө..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Издөө
            </Button>
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as DemoRequestStatus | '');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Жүктөлүүдө...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Демо сурамдары табылган жок</div>
          ) : (
            <>
              <Table columns={columns} data={requests} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
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
                    <span className="px-3 py-1 text-sm text-gray-600">
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
