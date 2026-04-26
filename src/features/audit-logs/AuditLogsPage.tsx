import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { auditLogsApi, type PlatformAuditLog, type AuditLogsQueryParams } from './auditLogsApi';
import { FileText } from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<PlatformAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<AuditLogsQueryParams>({
    action: '',
    targetType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [page, limit]);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await auditLogsApi.getAuditLogs({
        page,
        limit,
        action: filters.action || undefined,
        targetType: filters.targetType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      setLogs(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError('Маалыматты алуу мүмкүн болгон жок');
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const handleResetFilters = () => {
    setFilters({ action: '', targetType: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const toggleExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const getActionBadge = (action: string) => {
    const variant = 'neutral';
    return <Badge variant={variant}>{action}</Badge>;
  };

  const formatMetadata = (metadata: Record<string, any>) => {
    const entries = Object.entries(metadata);
    if (entries.length === 0) return null;

    return (
      <div className="mt-2 text-sm text-gray-600">
        {entries.map(([key, value]) => (
          <div key={key} className="flex">
            <span className="font-medium text-gray-700 mr-2">{key}:</span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Аудит логдор</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Чыпкалоо</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Аракет
                </label>
                <Input
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  placeholder="tenant_created"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максат түрү
                </label>
                <Input
                  value={filters.targetType}
                  onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
                  placeholder="Tenant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Башталган күнү
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Аякталган күнү
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Чыпкалоо</Button>
              <Button type="button" variant="secondary" onClick={handleResetFilters}>
                Тазалоо
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Платформа аудити</h2>
          <p className="text-sm text-gray-500 mt-1">
            Платформадагы бардык аракеттердин жаздырылышы
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Маалымат табылган жок"
              description="Аудит жаздырылышы жок. Фильтрлерди өзгөртүп көрүңүз."
            />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Жалпы: {total} жазуу
              </div>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{log.title}</h3>
                          {getActionBadge(log.action)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Аткарган:</span> {log.actorName} ({log.actorEmail})
                          </div>
                          <div>
                            <span className="font-medium">Ролу:</span> {log.actorRole}
                          </div>
                          <div>
                            <span className="font-medium">Максат:</span> {log.targetType} - {log.targetId}
                          </div>
                          <div>
                            <span className="font-medium">Убакыт:</span> {new Date(log.createdAt).toLocaleString('ky-KG')}
                          </div>
                        </div>
                      </div>
                    </div>
                    {Object.keys(log.metadata).length > 0 && (
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(log.id)}
                        >
                          {expandedLogId === log.id ? 'Жашыруу' : 'Деталдар'}
                        </Button>
                        {expandedLogId === log.id && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Метадата:</h4>
                            {formatMetadata(log.metadata)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Барак {page} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Мурдагы
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handlePageChange(page + 1)}
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
