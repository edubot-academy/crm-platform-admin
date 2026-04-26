# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-27

### Added

#### Demo Requests Management
- **Demo Requests Page**:
  - List all demo requests with pagination, search, and status filtering
  - Search by name, company, phone, or email
  - Filter by status (new, contacted, demo_scheduled, closed, spam)
  - Update demo request status directly from the table
  - Display source information (e.g., CRM Landing)
  - Show creation date with Kyrgyz locale formatting
  - Loading, error, and empty states
  - Full Kyrgyz UI localization
- **API Integration**:
  - GET `/api/platform/demo-requests` - List demo requests with pagination and filters
  - GET `/api/platform/demo-requests/:id` - Get demo request details
  - PATCH `/api/platform/demo-requests/:id/status` - Update demo request status
- **Navigation**:
  - Added route `/platform/demo-requests` to router
  - Added sidebar navigation item with MessageSquare icon
  - Label: "CRM Демо Сурамдары"

#### Type Safety
- TypeScript interfaces for demo requests:
  - `DemoRequest` - Demo request data model
  - `DemoRequestStatus` - Status type union
  - `DemoRequestsQueryParams` - Query parameters for listing
  - `DemoRequestsResponse` - Paginated response
  - `UpdateDemoRequestStatusData` - Status update payload

## [0.1.0] - 2026-04-26

### Initial Release

Platform Admin dashboard for Edubot CRM SaaS platform. This application is exclusively for platform superadmin users to manage the SaaS platform itself, not tenant business data.

### Added

#### Core Features
- **Dashboard**: Platform overview and statistics
- **Tenants Management**:
  - List all tenants with pagination, search, and status filtering
  - Create new tenant with plan assignment
  - View tenant details with settings
  - Update tenant information
  - Change tenant status (active, inactive, suspended, archived)
  - Delete tenant
- **Platform Users Management**:
  - List platform superadmin users
  - Create new superadmin user
  - Update user active status
  - View current user profile
- **Feature Flags**:
  - List all platform feature flags grouped by category
  - Toggle feature flags on/off
  - Kyrgyz language UI for all user-facing text
  - Category-based organization (Integrations, Core, Billing, etc.)
- **Plans Management**:
  - List subscription plans
  - Create new plans with limits and features
  - Update plan details
  - Change plan status
  - Assign plans to tenants
- **Audit Logs**:
  - View platform audit logs with pagination
  - Filter by action, actor, target type, and date range
- **Tenant Domains Management**:
  - List tenant domains with status badges
  - Create new domain with type selection (default/custom)
  - Set domain as primary
  - Update domain status (active, pending, failed, disabled)
  - Modal for domain creation
  - Loading, error, and empty states
- **Tenant Users Overview**:
  - List tenant users with pagination
  - View user details (name, email, role, status, last login, created date)
  - Update user status (active/inactive) with confirmation dialog
  - Role badges (Admin, Manager, Sales, Assistant)
  - Status badges (Active/Inactive)
  - Loading, error, and empty states
- **Tenant Settings**:
  - Platform-level tenant configuration
  - Editable fields: default language, timezone, currency, support email, platform notes
  - Read-only enabled modules summary
  - Form with loading, error, and empty states
  - Kyrgyz UI labels throughout
- **Settings**: Platform configuration interface
- **Authentication**:
  - Login page with superadmin role validation
  - JWT token-based authentication
  - Protected routes with role checking
  - Automatic redirect on 401 unauthorized

#### Shared Components
- `Badge`: Status indicator component
- `Button`: Reusable button with variants
- `Card`: Container component for content grouping
- `ConfirmDialog`: Confirmation modal for destructive actions
- `Input`: Form input with validation support
- `Table`: Data table with sorting and filtering

#### Infrastructure
- React 18 with TypeScript
- Vite build tool and dev server
- Tailwind CSS for styling
- React Router v6 for navigation
- Axios HTTP client with interceptors
- lucide-react for icons
- react-hot-toast for notifications
- ESLint with TypeScript support
- Prettier for code formatting

#### API Integration
- Centralized API client with:
  - 30-second request timeout
  - Automatic Bearer token injection
  - Request/response logging (dev mode)
  - Retry logic with exponential backoff for transient failures (408, 429, 500, 502, 503, 504)
  - Automatic 401 redirect to login

#### Type Safety
- TypeScript interfaces for all API models:
  - `Tenant`, `TenantSummary`, `TenantSettings`
  - `Plan`, `PlanLimits`, `PlanStatus`
  - `PlatformUser`, `CreatePlatformUserData`
  - `FeatureFlag`
  - `PlatformAuditLog`, `AuditLogMetadata`
  - `JWTPayload`, `LoginCredentials`, `AuthResponse`

#### Security & Quality
- Input validation for login credentials (email format, password length)
- Error handling for localStorage operations (private browsing support)
- TypeScript strict mode enabled
- Root `.gitignore` for monorepo-wide ignores
- Root `README.md` with comprehensive documentation
- Prettier configuration (`.prettierrc` and `.prettierignore`)
- Documentation comments for security considerations (localStorage XSS, JWT verification)

### Changed
- Updated `.env.example` to include `/api` prefix: `VITE_API_BASE_URL=http://localhost:4000/api`
- Enhanced JWT decoder with proper null checks and token structure validation
- Improved token store with localStorage availability checks

### Security Notes
- Tokens stored in localStorage (documented XSS vulnerability - consider httpOnly cookies for production)
- JWT decoder does not verify signature (documented - implement proper verification with backend public key)
- Role-based access control enforced on frontend (backend must also validate)

### API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/platform/tenants` - List tenants
- `POST /api/platform/tenants` - Create tenant
- `GET /api/platform/tenants/:id` - Get tenant details
- `PATCH /api/platform/tenants/:id` - Update tenant
- `PATCH /api/platform/tenants/:id/status` - Update tenant status
- `DELETE /api/platform/tenants/:id` - Delete tenant
- `GET /api/platform/users` - List platform users
- `GET /api/platform/users/me` - Get current user
- `POST /api/platform/users` - Create platform user
- `PATCH /api/platform/users/:id/status` - Update user status
- `GET /api/platform/feature-flags` - List feature flags
- `PUT /api/platform/feature-flags/:key` - Update feature flag
- `GET /api/platform/plans` - List plans
- `POST /api/platform/plans` - Create plan
- `PATCH /api/platform/plans/:id` - Update plan
- `PATCH /api/platform/plans/:id/status` - Update plan status
- `PATCH /api/platform/tenants/:tenantId/plan` - Assign plan to tenant
- `GET /api/platform/audit-logs` - List audit logs
- `GET /api/platform/tenants/:tenantId/domains` - List tenant domains
- `POST /api/platform/tenants/:tenantId/domains` - Create tenant domain
- `PATCH /api/platform/tenants/:tenantId/domains/:domainId/primary` - Set domain as primary
- `PATCH /api/platform/tenants/:tenantId/domains/:domainId/status` - Update domain status
- `GET /api/platform/tenants/:tenantId/users` - List tenant users with pagination
- `PATCH /api/platform/tenants/:tenantId/users/:userId/status` - Update user status
- `GET /api/platform/tenants/:tenantId/settings` - Get tenant platform settings
- `PATCH /api/platform/tenants/:tenantId/settings` - Update tenant platform settings

### Localization
- All user-facing UI text in Kyrgyz language
- Code comments and file names in English
- Feature flags page includes full Kyrgyz localization
