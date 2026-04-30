import type { TenantUserSummary } from '../tenantUsersApi';
import { Button } from '../../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/Card';
import { SectionIntro } from '../../../shared/components/SectionIntro';
import { TenantDataTable } from './TenantDataTable';
import { TenantSectionState } from './TenantSectionState';

interface TenantUsersTabProps {
  usersLoading: boolean;
  users: TenantUserSummary[];
  onCreateUser: () => void;
  renderUserRoleBadge: (role: string) => React.ReactNode;
  renderUserStatusBadge: (isActive: boolean) => React.ReactNode;
  userActionLoading: string | null;
  onResendInvite: (userId: string) => void;
  onDeactivateRequest: (user: TenantUserSummary) => void;
  onActivateRequest: (user: TenantUserSummary) => void;
  usersPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onLoadUsers: (params: { page: number; limit: number }) => void;
}

export function TenantUsersTab({
  usersLoading,
  users,
  onCreateUser,
  renderUserRoleBadge,
  renderUserStatusBadge,
  userActionLoading,
  onResendInvite,
  onDeactivateRequest,
  onActivateRequest,
  usersPagination,
  onLoadUsers,
}: TenantUsersTabProps) {
  return (
    <div className="space-y-6">
      <Card className="app-surface">
        <CardHeader>
          <SectionIntro
            title="Тенант колдонуучулары"
            description="Колдонуучуларды чакырып, алардын ролдорун жана активдүүлүк абалын tenant деңгээлинде башкаруу."
            actions={(
              <Button onClick={onCreateUser}>
                Жаңы колдонуучу кошуу
              </Button>
            )}
          />
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <TenantSectionState message="Жүктөлүүдө..." />
          ) : users.length === 0 ? (
            <TenantSectionState message="Колдонуучулар жок" />
          ) : (
            <>
              <TenantDataTable
                headers={['Аты-жөнү', 'Email', 'Роль', 'Статус', 'Акыркы кирүү', 'Түзүлгөн күнү', 'Аракеттер']}
              >
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-edubot-dark">{user.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-edubot-muted">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderUserRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderUserStatusBadge(user.isActive ?? false)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-edubot-muted">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ky-KG') : 'Кирген эмес'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-edubot-muted">
                      {new Date(user.createdAt).toLocaleDateString('ky-KG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onResendInvite(user.id.toString())}
                          disabled={userActionLoading === user.id.toString()}
                        >
                          {userActionLoading === user.id.toString() ? 'Күтүүдө...' : 'Чакыруу жөнөтүү'}
                        </Button>
                        {user.isActive === true && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onDeactivateRequest(user)}
                            disabled={userActionLoading === user.id.toString()}
                          >
                            {userActionLoading === user.id.toString() ? 'Күтүүдө...' : 'Өчүрүү'}
                          </Button>
                        )}
                        {user.isActive === false && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onActivateRequest(user)}
                            disabled={userActionLoading === user.id.toString()}
                          >
                            {userActionLoading === user.id.toString() ? 'Күтүүдө...' : 'Активдештирүү'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </TenantDataTable>
              {usersPagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-edubot-muted">
                    {usersPagination.total} колдонуучу, {usersPagination.page} барак / {usersPagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onLoadUsers({ page: usersPagination.page - 1, limit: usersPagination.limit })}
                      disabled={usersPagination.page === 1 || usersLoading}
                    >
                      Мурунку
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onLoadUsers({ page: usersPagination.page + 1, limit: usersPagination.limit })}
                      disabled={usersPagination.page === usersPagination.totalPages || usersLoading}
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
