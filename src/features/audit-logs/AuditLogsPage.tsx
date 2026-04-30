import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { Alert } from '../../shared/components/Alert';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { FilterBar, FilterBarItem } from '../../shared/components/FilterBar';
import { Input } from '../../shared/components/Input';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionIntro } from '../../shared/components/SectionIntro';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { SkeletonTable } from '../../shared/components/SkeletonTable';
import { EmptyState } from '../../shared/components/EmptyState';
import { auditLogsApi, type PlatformAuditLog, type AuditLogsQueryParams, type AuditLogMetadata } from './auditLogsApi';
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
  const [appliedFilters, setAppliedFilters] = useState<AuditLogsQueryParams>({
    action: '',
    targetType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = useCallback(async (nextPage: number, nextFilters: AuditLogsQueryParams) => {
    setLoading(true);
    setError('');
    try {
      const data = await auditLogsApi.getAuditLogs({
        page: nextPage,
        limit,
        action: nextFilters.action || undefined,
        targetType: nextFilters.targetType || undefined,
        dateFrom: nextFilters.dateFrom || undefined,
        dateTo: nextFilters.dateTo || undefined,
      });
      setLogs(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Маалыматты алуу мүмкүн болгон жок' : 'Маалыматты алуу мүмкүн болгон жок');
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs(page, appliedFilters);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [page, appliedFilters, loadLogs]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleResetFilters = () => {
    const emptyFilters = { action: '', targetType: '', dateFrom: '', dateTo: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    if (page !== 1) {
      setPage(1);
    }
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

  const formatMetadata = (metadata: AuditLogMetadata) => {
    const entries = Object.entries(metadata);
    if (entries.length === 0) return null;

    return (
      <div className="mt-2 text-sm text-edubot-muted">
        {entries.map(([key, value]) => (
          <div key={key} className="flex">
            <span className="mr-2 font-medium text-edubot-dark">{key}:</span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Аудит журналдары"
        description="Платформадагы бардык административдик аракеттерди убакыт, максат жана аткаруучу боюнча көзөмөлдөңүз."
      />

      <Card className="mb-6 app-surface">
        <CardHeader>
          <SectionIntro
            title="Чыпкалоо"
            description="Аракет, максат түрү жана дата диапазону аркылуу аудит агымын тактаңыз."
          />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <FilterBar className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <FilterBarItem>
                <div>
                  <label className="mb-1 block text-sm font-medium text-edubot-dark">
                    Аракет
                  </label>
                  <Input
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    placeholder="мисалы: колдонуучу түзүү"
                  />
                </div>
              </FilterBarItem>
              <FilterBarItem>
                <div>
                  <label className="mb-1 block text-sm font-medium text-edubot-dark">
                    Максат түрү
                  </label>
                  <Input
                    value={filters.targetType}
                    onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
                    placeholder="мисалы: Колдонуучу"
                  />
                </div>
              </FilterBarItem>
              <FilterBarItem>
                <div>
                  <label className="mb-1 block text-sm font-medium text-edubot-dark">
                    Башталган күнү
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
              </FilterBarItem>
              <FilterBarItem>
                <div>
                  <label className="mb-1 block text-sm font-medium text-edubot-dark">
                    Аякталган күнү
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </FilterBarItem>
            </FilterBar>
            <div className="flex gap-2">
              <Button type="submit">Чыпкалоо</Button>
              <Button type="button" variant="secondary" onClick={handleResetFilters}>
                Тазалоо
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="Платформадагы аракеттер журналы"
            description="Платформадагы бардык административдик аракеттер ушул жерде көрсөтүлөт."
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Маалымат табылган жок"
              description="Аудит жаздырылышы жок. Фильтрлерди өзгөртүп көрүңүз."
            />
          ) : (
            <>
              <div className="mb-4 text-sm text-edubot-muted">
                Жалпы: {total} жазуу
              </div>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-[1.5rem] border border-edubot-line bg-white/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-edubot-orange/30 hover:shadow-edubot-soft"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-edubot-dark">{log.title}</h3>
                          {getActionBadge(log.action)}
                        </div>
                        <div className="space-y-1 text-sm text-edubot-muted">
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
                          <div className="mt-2 rounded-2xl border border-edubot-line bg-edubot-surfaceAlt/80 p-3">
                            <h4 className="mb-2 text-sm font-medium text-edubot-dark">Метадата:</h4>
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
                  <div className="text-sm text-edubot-muted">
                  Бет {page} / {totalPages}
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
