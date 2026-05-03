# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2026-05-04

### Added
- **AI Feature Flags Management**: Platform-level control over AI features
  - Added `ai_assist_enabled` and `ai_followup_drafts_enabled` feature flags to PlatformFeatureFlagsPage
  - AI flags categorized under "Integrations" category with proper descriptions
  - Toggle switches for enabling/disabling AI features at platform level
  - Feature flag changes propagate to all tenants respecting platform/tenant override hierarchy
  - Full Kyrgyz localization for AI feature descriptions and labels

### Changed
- **Feature Categories**: Updated category filtering to include new AI flags under "Integrations"
- **Platform Dashboard**: AI feature status now reflected in platform overview statistics

## [0.7.1] - 2026-04-30

### Fixed

- Added missing `message` column to demo requests table with truncation and hover tooltip
- Updated SkeletonTable column count to match new table layout

## [0.7.0] - 2026-04-30

### Added

#### Comprehensive Style & Architectural Update

**New Shared Components**:
- Created `InviteLinkBanner` component for reusable invite link display with copy-to-clipboard
- Created `CreateUserModal` component for tenant user creation with form validation
- Created `SectionIntro` component for consistent section headers with descriptions
- Created `FilterBar` and `FilterBarItem` components for responsive filter layouts
- Created `FormModal` component with focus trapping, keyboard navigation, and accessibility
- Created `Switch` component for toggle switches with aria-label support
- Created `LoadingSpinner` component with size variants
- Created `SkeletonCard` and `SkeletonTable` components for loading states
- Created `EmptyState` component for no-data states with optional actions
- Created `Alert` component with success, error, warning, and info variants
- Created `ErrorBoundary` component for global error handling

**Enhanced Shared Components**:
- Enhanced `Button` with loading states, icon support, focus rings, and EduBot brand colors
- Enhanced `Card` with elevation system, hoverable states, and refined shadows
- Enhanced `Badge` with colorblind-friendly icons and semantic variants
- Enhanced `Input` with floating labels, helper text, character counts, and focus states
- Enhanced `Select` with keyboard navigation, search, accessibility, and custom styling
- Enhanced `Table` with sticky headers, row selection, sorting, and ARIA attributes
- Enhanced `ConfirmDialog` with focus trapping, Escape key support, and accessibility
- Enhanced `PageHeader` with actions area for page-specific buttons
- Enhanced `PageActionsContext` for dynamic page header actions

**Feature Page Updates**:
- Updated `PlatformDashboardPage` with new card layout, stat cards, and export functionality
- Updated `TenantsPage` with search, filters, pagination, table/card views, and empty states
- Updated `TenantDetailPage` with tabbed interface, modals, and improved layout
- Updated `PlansPage` with visual feature/limit editors, comparison table, and card views
- Updated `PlatformUsersPage` with invite link display, user management, and empty states
- Updated `PlatformFeatureFlagsPage` with search, category filtering, and toggle switches
- Updated `AuditLogsPage` with filters, pagination, and log detail expansion
- Updated `DemoRequestsPage` with search, status filters, and inline status updates
- Updated `PlatformSettingsPage` with form layout and sectioned settings
- Updated `InviteAcceptPage` with password strength indicator and validation
- Updated `LoginPage` with improved layout and error handling

**Layout & Navigation**:
- Updated `PlatformLayout` with responsive sidebar, topbar, and user dropdown
- Updated router with lazy loading for all routes and error boundaries
- Added `/accept-invite` public route for invite acceptance

**Design System**:
- Expanded Tailwind config with EduBot brand colors (navy, orange, green, teal)
- Added custom shadows (`shadow-edubot-card`, `shadow-edubot-hover`, `shadow-edubot-soft`)
- Added custom border radius tokens (`rounded-panel`, `rounded-[1.5rem]`, etc.)
- Added custom spacing scale and animation utilities
- Added surface colors (`edubot-surface`, `edubot-surfaceAlt`)
- Added semantic color palette for success, warning, error, info states

**API Updates**:
- Updated `tenantSettingsApi` with current backend contract for tenant settings
- Updated `tenantUsersApi` with `isActive` boolean normalization
- Updated `platformUsersApi` with `name`/`fullName` response shape handling

### Changed

- **All feature pages**: Migrated to new shared components and design system
- **All shared components**: Updated to use EduBot brand colors and design tokens
- **Layout**: Improved responsive behavior and mobile navigation
- **Styling**: Consistent rounded corners, shadows, and spacing throughout
- **Accessibility**: Added ARIA labels, focus management, and keyboard navigation
- **Loading states**: Replaced hardcoded text with skeleton components
- **Empty states**: Replaced hardcoded text with EmptyState components
- **Error handling**: Added ErrorBoundary and improved error displays
- **Typography**: Consistent font sizes, weights, and colors
- **Color usage**: Replaced hardcoded colors with design token classes

### Fixed

- Fixed tenant table rendering against current `/platform/tenants` response contract
- Fixed tenant search, status filter, and pagination behavior
- Fixed tenant settings module rendering for boolean module maps
- Fixed platform user display-name rendering for current backend responses
- Fixed stale invite acceptance error messaging
- Fixed onboarding feedback for invite-delivery failures
- Fixed duplicate Tailwind CSS utility class in `index.css`
- Fixed mixed-language toast message in `useTenantDetailPage.ts` (`белгилendi` → `белгиленди`)
- Removed unused `import React from 'react'` in `Badge.tsx`
- Removed empty component subdirectories under `src/shared/components/`

## [0.6.0] - 2026-04-29

### Added

#### Platform Tenant Onboarding

- Added one-step tenant onboarding flow in `CreateTenantPage`
- Added onboarding result view with tenant, admin, plan, feature, and module summaries
- Added frontend support for backend `OnboardTenantResponse` and `OnboardTenantData` contracts

### Changed
- Updated tenant list page to use paginated tenant API responses with `items`, `total`, `page`, `limit`, and `totalPages`
- Updated tenant list and tenant detail views to use `primaryDomain` and structured `plan` objects instead of older raw tenant fields
- Updated tenant settings UI to consume `enabledModules` as a boolean map
- Updated platform users UI to use invite-first creation semantics and current backend `name` / `fullName` response shape
- Updated auth/session handling to use session-backed access and refresh tokens with automatic refresh support
- Updated logout flow to send the correct platform or tenant context when revoking sessions
- Updated invite acceptance flow to pass tenant context from invite links when available
- Updated tenant detail editing flow so plan assignment stays on the dedicated plan endpoint instead of the generic tenant update form

### Fixed
- Fixed tenant table rendering against the current `/platform/tenants` response contract
- Fixed tenant search, status filter, created-date filter, and pagination behavior in the platform admin tenant list
- Fixed tenant settings module rendering when backend returns boolean module maps
- Fixed onboarding feedback so invite-delivery failures render as warning states instead of green success states
- Fixed platform user display-name rendering for current backend responses
- Fixed stale invite acceptance error messaging that still implied the backend flow was not implemented

## [0.5.0] - 2026-04-28

### Added

#### Invite Link Functionality

**Tenant Users**:
- Added `inviteLink` field to `TenantUserSummary` interface
- Added `resendInvite()` API endpoint for tenant users (`POST /platform/tenants/:tenantId/users/:userId/resend-invite`)
- Added invite link display banner in TenantDetailPage after user creation
- Added copy to clipboard functionality for invite links
- Added "Чакыруу жөнөтүү" (Resend Invite) button in tenant users table
- Created `InviteLinkBanner` component for reusable invite link display
- Created `CreateUserModal` component to reduce TenantDetailPage size

**Platform Users**:
- Added `inviteLink` field to `PlatformUser` interface
- Added `resendInvite()` API endpoint for platform users (`POST /platform/users/:id/resend-invite`)
- Added invite link display banner in PlatformUsersPage after user creation
- Added copy to clipboard functionality for invite links
- Added "Чакыруу жөнөтүү" (Resend Invite) button in platform users table
- Reused `InviteLinkBanner` component for consistent UI

**Invite Acceptance**:
- Created `InviteAcceptPage` component for password setup on invite acceptance
- Added password strength indicator with 5-level visual meter (Азырк, Орто, Жакшы, Мыкты, Өтө мыкты)
- Password validation: minimum 8 characters, uppercase, numbers, special characters
- Added `/accept-invite` public route to router
- Integrated with backend endpoint `POST /auth/accept-invite`
- Success message display after password setup

**Architectural Improvements**:
- Added `ErrorBoundary` components to router for better error handling (login, accept-invite, platform routes)
- Extracted `InviteLinkBanner` component from TenantDetailPage for reusability
- Extracted `CreateUserModal` component from TenantDetailPage for maintainability
- Reduced TenantDetailPage from ~1227 lines to ~1150 lines

### Changed
- Standardized user status field from `status` to `isActive` (boolean) across all interfaces
- Updated `TenantUserSummary`, `GetTenantUsersParams`, `UpdateTenantUserStatusDto`, `CreateTenantUserDto` to use `isActive: boolean`
- Updated `TenantDetailPage` to use `isActive` instead of `status`
- Removed "Ачуу" (Open) button from invite link banner to prevent 404 errors (invite links are for tenant CRM app, not platform admin)
- Updated invite link banner label to "Чакыруу шилтемеси (колдонуучуга жөнөтүңүз):" for clarity

### Fixed
- Removed unused `Copy` import from TenantDetailPage after component extraction
- Removed unused `navigate` import from InviteAcceptPage after removing auto-redirect

## [0.4.0] - 2026-04-27

### Added

#### UX/UI Design Audit - Phase 5 (Polish)

**Accessibility Improvements**:
- Added aria-labels to all icon-only buttons throughout the application
- Implemented focus trapping in ConfirmDialog modal with Escape key support
- Added comprehensive keyboard navigation to Select component (arrow keys, Enter, Escape, Home, End)
- Added ARIA roles and attributes to Table component (role="table", aria-sort, aria-selected, etc.)
- Added icons to Badge component for colorblind accessibility (Check, AlertTriangle, X, Info, Minus)
- Added role="switch" and aria-checked to feature flag toggle switches
- Added role="tab" and aria-selected to tab navigation buttons
- Added aria-expanded to dropdown buttons for better screen reader support
- Added aria-live="polite" to empty state messages for dynamic content announcements

**Error Handling**:
- Created ErrorBoundary component with user-friendly error display and recovery options
- Wrapped entire application with ErrorBoundary for global error catching
- ErrorBoundary provides error details and retry functionality

**Performance Optimizations**:
- Implemented lazy loading for all route components using React.lazy
- Added Suspense boundaries with loading spinners for all lazy-loaded routes
- Improved initial application load time by code-splitting page components

**Animation Utilities**:
- Added fade-in, fade-out animations for smooth transitions
- Added slide-in, slide-out animations for content appearing/disappearing
- Added scale-in, scale-out animations for modal and card interactions
- Added bounce-short animation for interactive feedback
- Enhanced Tailwind config with comprehensive animation keyframes

**Feature Enhancements**:
- Added create user modal to TenantDetailPage with form validation
- Added ability to create new tenant users with name, email, role, status, and invite options
- Integrated dashboard API to fetch real platform overview data
- Added feature flags overview card to dashboard showing total, enabled, and disabled flags
- Added recent audit logs card to dashboard showing latest platform actions
- Simplified dashboard display by removing complex charts in favor of clear status breakdowns

### Changed
- Updated Button component with focus ring styles for better keyboard navigation visibility
- Updated Input component with focus ring styles
- Updated Select component with focus ring styles and ARIA attributes
- Updated ConfirmDialog with focus trapping and keyboard navigation
- Updated Table component with proper ARIA roles and live regions
- Updated Badge component with optional icon display for accessibility
- Updated router.tsx to use lazy loading for all routes

### Fixed
- Fixed TypeScript import errors in ErrorBoundary (type-only imports)
- Fixed TypeScript errors in Select component keyboard navigation
- Fixed TypeScript errors in ConfirmDialog useEffect hook
- Fixed button text visibility issue by using arbitrary Tailwind color values with explicit hex codes
- Fixed loading spinner visibility in primary and danger button variants

## [0.3.0] - 2026-04-27

### Added

#### UX/UI Design Audit - Phase 4 (Dashboard, Tenants, Feature Flags, Plans)

**Dashboard Improvements**:
- Added line chart for tenant trends over time using Recharts
- Added bar chart for tenant status comparison (active/inactive/suspended)
- Enhanced stat cards with sparkline visualizations using AreaChart
- Added date range picker for filtering dashboard data
- Added export functionality to download dashboard data as JSON
- Improved visual hierarchy and data presentation

**Tenants Page Enhancements**:
- Added bulk action toolbar with selection state management
- Added advanced filter panel with search and category filters
- Added toggle button to show/hide advanced filter panel
- Added visual editor for tenant limits/features (replaced JSON input)
- Added card view option with table/card toggle buttons
- Added quick actions dropdown to table rows (View, Edit, Delete options)
- Improved user experience for managing multiple tenants

**Feature Flags Page Improvements**:
- Improved toggle switch design with better styling and hover effects
- Added search functionality to filter flags by name or description
- Added category filtering dropdown to filter by flag category
- Added expandable descriptions with show/hide buttons for long descriptions
- Added visual feedback for core module flags (non-toggleable)
- Enhanced flag card layout with hover effects

**Plans Page Enhancements**:
- Created visual feature editor with checkboxes (replaced JSON input)
- Created visual limits editor with number inputs (replaced JSON input)
- Added plan comparison table showing pricing, features, and limits side by side
- Improved pricing display with colored badges (primary for monthly, green for yearly)
- Added pricing ratio display (yearly vs monthly multiplier)
- Added feature checklist UI with Check/X icons for enabled/disabled features
- Enhanced plan card layout with better visual hierarchy

**Infrastructure**:
- Added `recharts` dependency for charting capabilities
- Added Check and X icons from lucide-react for checklist UI

### Changed
- Updated `PlatformDashboardPage` with charts, sparklines, date picker, and export
- Updated `TenantsPage` with bulk actions, advanced filters, card view, and quick actions
- Updated `PlatformFeatureFlagsPage` with improved toggles, search, and category filtering
- Updated `PlansPage` with visual editors, comparison table, and improved pricing display
- Fixed TypeScript error in TenantsPage view toggle buttons (added iconOnly children)
- Updated `DESIGN_TASKS.md` progress: Phase 4 at 74% (14/19 tasks complete)

## [0.2.0] - 2026-04-27

### Added

#### Design System Implementation (Phase 1 & 2)
- **Design Tokens**:
  - Comprehensive color palette (primary, secondary, semantic colors for success, warning, error, info)
  - Typography scale (xs to 5xl with line heights)
  - Custom spacing scale (18, 88, 128)
  - Border radius tokens (sm, md, lg, xl, 2xl, 3xl)
  - Shadow depth system (sm, md, lg, xl, 2xl, inner)
  - Custom animations (shimmer, spin-slow)
- **Loading & Empty State Components**:
  - `SkeletonCard` - Card loading placeholder with shimmer animation
  - `SkeletonTable` - Table loading placeholder with configurable rows/columns
  - `LoadingSpinner` - SVG-based spinner with size variants (sm, md, lg)
  - `EmptyState` - Empty state component with icon, title, description, and action button
- **Enhanced Shared Components**:
  - `Button`:
    - Added `loading` prop with integrated LoadingSpinner
    - Added `leftIcon` and `rightIcon` props for icon support
    - Added `iconOnly` prop for icon-only buttons
    - Improved disabled state visual feedback
    - Updated to use design token colors
    - Added shadow effects on hover
  - `Input`:
    - Added `floating` prop for floating label variant with animation
    - Added `helperText` prop for additional context below input
    - Added `showCharCount` and `maxLength` props for character counter
    - Updated to use design token colors
  - `Card`:
    - Added `elevation` prop (none, sm, md, lg, xl) for shadow control
    - Added `hoverable` prop with lift effect on hover
  - `Table`:
    - Added `stickyHeader` prop for sticky table headers
    - Added `selectable` prop for checkbox row selection
    - Added `onSelectionChange` callback for selection handling
    - Added `sortable` column property with visual indicators
    - Added `emptyMessage` prop for customizable empty state
    - Implemented column sorting (asc/desc/null cycle)
    - Implemented select-all functionality
    - Updated to use design token colors for selected states
- **New Components**:
  - `Select` - Custom select dropdown component to replace native select elements
    - Searchable dropdown with keyboard navigation
    - Disabled option support
    - Error and helper text support
    - Click-outside-to-close behavior
  - `JsonEditor` - JSON editor component with validation and formatting
    - Real-time JSON validation with visual feedback
    - Format button for pretty-printing JSON
    - Character counter and error display
    - Monospace font for code readability
- **Feature Page Updates**:
  - Replaced all hardcoded "Жүктөлүүдө..." (Loading...) text with SkeletonTable/SkeletonCard components
  - Replaced all hardcoded "Маалымат жок" (No data) text with EmptyState components
  - Updated pages: TenantsPage, PlatformUsersPage, PlansPage, PlatformFeatureFlagsPage, DemoRequestsPage, AuditLogsPage, TenantDetailPage

#### Documentation
- Added `DESIGN_TASKS.md` - Comprehensive design implementation task tracking document
  - 75 tasks organized into 5 phases
  - Progress tracking with completion percentages
  - Phase 1 (Foundation): 100% complete
  - Phase 2 (Components): 100% complete

### Changed
- Updated `tailwind.config.js` with comprehensive design token system
- All shared components now use design token colors instead of hardcoded values
- Improved loading and empty state UX across all feature pages
- Enhanced component accessibility with proper ARIA labels

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
