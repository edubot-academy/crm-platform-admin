import { useParams, Link } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { ArrowLeft, Globe } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';
import { InviteLinkBanner } from './components/InviteLinkBanner';
import { CreateUserModal } from './components/CreateUserModal';
import { TenantDomainsTab } from './components/TenantDomainsTab';
import { TenantOverviewTab } from './components/TenantOverviewTab';
import { TenantPlanTab } from './components/TenantPlanTab';
import { TenantSettingsTab } from './components/TenantSettingsTab';
import { TenantSectionState } from './components/TenantSectionState';
import { TenantUsersTab } from './components/TenantUsersTab';
import {
  renderDomainStatusBadge,
  renderDomainTypeBadge,
  renderSuccessBadge,
  renderTenantStatusBadge,
  renderUserRoleBadge,
  renderUserStatusBadge,
  TENANT_DETAIL_TABS,
  TENANT_INFO_ROW_CLASSES,
} from './tenantDetailView';
import { useTenantDetailPage } from './useTenantDetailPage';

export function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const {
    tenant,
    plans,
    domains,
    users,
    usersPagination,
    settings,
    settingsForm,
    settingsLoading,
    settingsSaving,
    loading,
    plansLoading,
    domainsLoading,
    usersLoading,
    error,
    success,
    activeTab,
    isEditing,
    editForm,
    selectedPlanId,
    statusLoading,
    planAssignLoading,
    showCreateDomainModal,
    createDomainForm,
    domainActionLoading,
    userActionLoading,
    showCreateUserModal,
    createUserForm,
    createUserLoading,
    createUserError,
    inviteLink,
    showInviteLink,
    confirmDialog,
    enabledModuleKeys,
    setSettingsForm,
    setActiveTab,
    setIsEditing,
    setEditForm,
    setSelectedPlanId,
    setShowCreateDomainModal,
    setCreateDomainForm,
    setShowCreateUserModal,
    setCreateUserForm,
    setShowInviteLink,
    setConfirmDialog,
    setCreateUserError,
    handleEditSubmit,
    handleStatusChange,
    handlePlanAssign,
    handleCreateDomain,
    handleSetPrimary,
    handleUpdateDomainStatus,
    handleUpdateUserStatus,
    handleResendInvite,
    handleCopyInviteLink,
    handleCreateUser,
    handleSettingsSubmit,
    loadUsers,
  } = useTenantDetailPage(tenantId);

  if (loading) {
    return <TenantSectionState message="Жүктөлүүдө..." />;
  }

  if (!tenant) {
    return <EmptyState icon={Globe} title="Уюм табылган жок" description="Тандалган уюм боюнча маалымат табылган жок." />;
  }

  const alertBaseClasses = 'mb-4';
  const showEditButton = activeTab === 'overview';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/platform/tenants">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Артка
            </Button>
          </Link>
          <div>
            <h1 className="app-heading">{tenant.name}</h1>
            <p className="app-subtle">{tenant.slug}</p>
          </div>
        </div>
        {showEditButton && (
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Жокко чыгаруу' : 'Оңдоо'}
          </Button>
        )}
      </div>

      {success && <Alert variant="success" className={alertBaseClasses}>{success}</Alert>}

      {error && <Alert variant="error" className={alertBaseClasses}>{error}</Alert>}

      {showInviteLink && inviteLink && (
        <InviteLinkBanner
          inviteLink={inviteLink}
          onCopy={handleCopyInviteLink}
          onClose={() => setShowInviteLink(false)}
        />
      )}

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto rounded-[1.75rem] border border-edubot-line bg-white/80 p-2 shadow-edubot-card">
        <nav className="flex min-w-max gap-2">
          {TENANT_DETAIL_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-edubot-orange/10 text-edubot-orange shadow-sm'
                  : 'text-edubot-muted hover:bg-edubot-orange/5 hover:text-edubot-dark'
                  }`}
                aria-label={tab.label}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <TenantOverviewTab
          tenant={tenant}
          isEditing={isEditing}
          editForm={editForm}
          onEditFormChange={setEditForm}
          onEditSubmit={handleEditSubmit}
          onCancelEdit={() => setIsEditing(false)}
          loading={loading}
          statusLoading={statusLoading}
          onStatusChange={handleStatusChange}
          statusBadge={renderTenantStatusBadge(tenant.status)}
          infoRowClasses={TENANT_INFO_ROW_CLASSES}
        />
      )}

      {activeTab === 'plan' && (
        <TenantPlanTab
          tenant={tenant}
          plans={plans}
          plansLoading={plansLoading}
          selectedPlanId={selectedPlanId}
          onSelectedPlanIdChange={setSelectedPlanId}
          onSubmit={handlePlanAssign}
          planAssignLoading={planAssignLoading}
        />
      )}

      {activeTab === 'domains' && (
        <TenantDomainsTab
          domainsLoading={domainsLoading}
          domains={domains}
          onCreateDomain={() => setShowCreateDomainModal(true)}
          renderDomainTypeBadge={renderDomainTypeBadge}
          renderDomainStatusBadge={renderDomainStatusBadge}
          renderSuccessBadge={renderSuccessBadge}
          domainActionLoading={domainActionLoading}
          onSetPrimary={handleSetPrimary}
          onUpdateDomainStatus={handleUpdateDomainStatus}
        />
      )}

      {activeTab === 'users' && (
        <TenantUsersTab
          usersLoading={usersLoading}
          users={users}
          onCreateUser={() => setShowCreateUserModal(true)}
          renderUserRoleBadge={renderUserRoleBadge}
          renderUserStatusBadge={renderUserStatusBadge}
          userActionLoading={userActionLoading}
          onResendInvite={handleResendInvite}
          onDeactivateRequest={(user) => {
            setConfirmDialog({
              isOpen: true,
              title: 'Колдонуучуну өчүрүү',
              message: `${user.name} өчүрүлсө, бул уюмдун системасына кире албай калат. Улантасызбы?`,
              onConfirm: () => handleUpdateUserStatus(user.id.toString(), false),
            });
          }}
          onActivateRequest={(user) => {
            setConfirmDialog({
              isOpen: true,
              title: 'Колдонуучуну активдештирүү',
              message: `${user.name} үчүн кирүү мүмкүнчүлүгүн кайра ачасызбы?`,
              onConfirm: () => handleUpdateUserStatus(user.id.toString(), true),
            });
          }}
          usersPagination={usersPagination}
          onLoadUsers={loadUsers}
        />
      )}

      {activeTab === 'settings' && (
        <TenantSettingsTab
          settingsLoading={settingsLoading}
          settings={settings}
          settingsForm={settingsForm}
          onSettingsFormChange={setSettingsForm}
          enabledModuleKeys={enabledModuleKeys}
          onSubmit={handleSettingsSubmit}
          settingsSaving={settingsSaving}
        />
      )}

      {activeTab !== 'overview' && activeTab !== 'plan' && activeTab !== 'domains' && activeTab !== 'users' && activeTab !== 'settings' && (
        <Card className="app-surface">
          <CardContent className="p-8 text-center text-edubot-muted">
            Бул бөлүк азырынча жеткиликтүү эмес.
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } })}
      />

      {/* Create Domain Modal */}
      {showCreateDomainModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-edubot-dark/45 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h2 className="text-lg font-semibold text-edubot-dark">Жаңы домен кошуу</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateDomain} className="space-y-4">
                  <Input
                    label="Домен"
                    value={createDomainForm.domain}
                    onChange={(e) => setCreateDomainForm({ ...createDomainForm, domain: e.target.value })}
                    placeholder="example.com"
                    required
                  />
                  <Select
                    label="Түрү"
                    value={createDomainForm.type}
                    onChange={(value) => setCreateDomainForm({ ...createDomainForm, type: value as 'default' | 'custom' })}
                    options={[
                      { value: 'default', label: 'Стандарттык' },
                      { value: 'custom', label: 'Жеке' },
                    ]}
                  />
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowCreateDomainModal(false);
                        setCreateDomainForm({ domain: '', type: 'default' });
                      }}
                      disabled={domainActionLoading === 'create'}
                    >
                      Жокко чыгаруу
                    </Button>
                    <Button type="submit" disabled={domainActionLoading === 'create'}>
                      {domainActionLoading === 'create' ? 'Сактоо...' : 'Сактоо'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        form={createUserForm}
        error={createUserError}
        loading={createUserLoading}
        onChange={setCreateUserForm}
        onSubmit={handleCreateUser}
        onClose={() => {
          setShowCreateUserModal(false);
          setCreateUserForm({
            name: '',
            email: '',
            role: 'admin',
            isActive: true,
            sendInvite: true,
          });
          setCreateUserError('');
        }}
      />
    </div>
  );
}
