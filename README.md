# Platform Admin - Edubot CRM

Platform Owner / Superadmin portal for Edubot CRM SaaS platform.

## Purpose

This app is **ONLY** for platform-level SUPERADMIN users. It manages the SaaS/platform itself, not tenant CRM business data.

### Platform-Level Only

- **Does NOT show**: leads, contacts, deals, payments, enrollments, retention cases, trial lessons
- **Does NOT manage**: tenant CRM business modules
- **ONLY manages**: tenants, platform users, feature flags, plans, audit logs, platform settings

### Access Control

- Users must have `role = superadmin` and `company/tenant = null`
- Tenant users belong in the tenant CRM app, not here
- Login rejects non-superadmin users with Kyrgyz error message

## Tech Stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- lucide-react

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

## Routes

- `/login` - Login page (superadmin only)
- `/platform` - Dashboard
- `/platform/tenants` - Tenants list
- `/platform/tenants/new` - Create new tenant
- `/platform/tenants/:tenantId` - Tenant details
- `/platform/users` - Platform users (superadmins only)
- `/platform/feature-flags` - Platform feature flags
- `/platform/plans` - Subscription plans
- `/platform/audit-logs` - Audit logs
- `/platform/settings` - Platform settings

## API Endpoints

The app expects the following backend endpoints:

- `POST /api/auth/login` - User login
- `GET /api/platform/tenants` - List all tenants
- `POST /api/platform/tenants` - Create tenant
- `GET /api/platform/tenants/:id` - Get tenant details
- `PUT /api/platform/tenants/:id` - Update tenant
- `DELETE /api/platform/tenants/:id` - Delete tenant
- `GET /api/platform/users` - List platform users
- `POST /api/platform/users` - Create platform user
- `DELETE /api/platform/users/:id` - Delete platform user
- `GET /api/platform/feature-flags` - List feature flags
- `PUT /api/platform/feature-flags/:key` - Update feature flag
- `GET /api/platform/plans` - List plans (placeholder UI if not ready)
- `GET /api/platform/audit-logs` - List audit logs (placeholder UI if not ready)

## Language

- All visible UI text is in **Kyrgyz**
- Code comments and file names remain in **English**

## Backend Requirements

The following backend endpoints are required for full functionality:

**Required:**
- `/api/auth/login` - Returns JWT with role and companyId
- `/api/platform/tenants` - CRUD operations for tenants
- `/api/platform/users` - CRUD operations for platform users
- `/api/platform/feature-flags` - Feature flag management

**Optional (placeholder UI provided):**
- `/api/platform/plans` - Plans management
- `/api/platform/audit-logs` - Audit logging

## Domain Model

- `crm.edubot.it.com` - Public CRM marketing website
- `admin.crm.edubot.it.com` - Platform Owner / Superadmin portal (this app)
- `edupro-crm.edubot.it.com` - EduPro tenant CRM app
- `{tenant}-crm.edubot.it.com` - Future tenant CRM apps
