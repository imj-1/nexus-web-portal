# Nexus Web Portal

A modern, Angular-based banking web application providing customers with a clean interface to manage accounts, view transactions, and initiate transfers. Nexus is designed with an institutional-grade aesthetic and integrates with a Spring-based API gateway and Keycloak for authentication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Service Communication](#service-communication)
- [API Gateway & BFF Aggregation](#api-gateway--bff-aggregation)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Available Scripts](#available-scripts)
- [Running Tests](#running-tests)
- [Design System](#design-system)

---

## Tech Stack

- **Framework:** Angular 18 (standalone components)
- **UI Library:** Angular Material 18
- **Auth:** Keycloak via `keycloak-angular` / `keycloak-js`
- **Styling:** SCSS with CSS custom properties (design token system)
- **HTTP:** Angular `HttpClient` with a functional auth interceptor
- **State:** RxJS (no external state management library)

---

## Architecture Overview

```
src/
├── app/
│   ├── core/               # Auth guard, interceptor, Keycloak init, services
│   ├── features/           # Feature modules: auth, dashboard, accounts, transfer
│   ├── layout/             # Shell, navbar, sidebar, home page
│   └── shared/             # SharedModule (re-exported Angular Material modules)
├── environments/           # environment.ts / environment.prod.ts
└── styles.scss             # Global styles and CSS design tokens
```

The app uses a **shell layout pattern**: authenticated routes are wrapped by `ShellComponent`, which provides the sticky navbar and collapsible sidenav. Unauthenticated routes (home, login, register) render outside the shell.

All protected API calls attach a Keycloak bearer token via `authInterceptor`. On a 401 response, the interceptor automatically attempts a token refresh before retrying.

The Angular app **never calls account-service or transaction-service directly**. All traffic flows through the API gateway at `http://localhost:8080`, which handles JWT validation, CORS, rate limiting, and request routing before any request reaches a downstream service.

---

## Service Communication

The Nexus backend is composed of three independently deployable services, an API gateway, and Keycloak for identity. Here is how they relate to each other:

```
Angular App (4200)
       │
       │  All requests → Bearer token attached by authInterceptor
       ▼
API Gateway (8080)  ──── Keycloak (8180) [JWT validation + introspection]
       │
       ├──── account-service (8081)      PostgreSQL: nexus_accounts
       │          │
       │          └── Internal endpoints called by transaction-service only
       │              PATCH /internal/v1/accounts/{id}/debit
       │              PATCH /internal/v1/accounts/{id}/credit
       │
       └──── transaction-service (8083)  PostgreSQL: nexus_transactions
                  │
                  └── Calls account-service internally to:
                      1. Validate account exists before creating a transaction
                      2. Debit/credit the account balance after a transaction settles
                      3. Snapshot the resulting balance onto the transaction record
```

**Data ownership is strictly separated:**

| Concern                                              | Owned By                                      |
|------------------------------------------------------|-----------------------------------------------|
| Account identity, present balance, available balance | account-service                               |
| Transaction records, running balance snapshots       | transaction-service                           |
| Monthly deposit / withdrawal aggregates              | transaction-service (queried at request time) |
| JWT issuance and validation                          | Keycloak                                      |
| CORS, rate limiting, circuit breaking                | API gateway                                   |

**Internal vs public endpoints:**

account-service exposes two sets of endpoints. Public endpoints (`/api/v1/accounts/**`) flow through the gateway and are accessible to the Angular app. Internal endpoints (`/internal/v1/accounts/**`) are called only by transaction-service and are not routed through the gateway, keeping balance mutation off the public API surface.

---

## API Gateway & BFF Aggregation

The API gateway acts as both a **reverse proxy** and a **Backend for Frontend (BFF)** aggregation layer. Rather than forcing the Angular app to make multiple round trips to assemble a single page, the gateway performs the fan-out and merge server-side.

### Account Dashboard Aggregation

When the Angular app visits `/accounts/:id`, it makes a single request:

```
GET /api/v1/accounts/{accountId}/dashboard
```

The gateway's `AccountDashboardController` intercepts this route before it reaches the proxy rules, and fans out **three parallel calls**:

```
Gateway
  ├── GET account-service  /api/v1/accounts/{id}
  │       → account details, present balance, available balance
  │
  ├── GET transaction-service  /api/v1/transactions/account/{id}?page=&size=
  │       → paginated transaction ledger with per-row running balance
  │
  └── GET transaction-service  /api/v1/transactions/account/{id}/summary
          → current month total deposits and total withdrawals
```

All three calls are fired concurrently via `Mono.zip`. When all three resolve, the results are merged into a single `AccountDashboardResponse` and returned to the Angular app in one HTTP response. If either transaction-service call fails, it falls back to an empty result so the account header still renders.

**Why this matters:** without the BFF layer, the Angular app would need to make three sequential or parallel calls, manage three separate loading states, handle partial failures across three subscriptions, and stitch the data together in the component. The gateway absorbs all of that complexity so the component only needs to handle one Observable.

### Routing Rules

The gateway uses Spring Cloud Gateway route predicates to decide where each request goes:

| Path pattern                                | Destination                                           |
|---------------------------------------------|-------------------------------------------------------|
| `/api/v1/accounts/{id}/dashboard`           | Handled locally by `AccountDashboardController` (BFF) |
| `/api/v1/accounts/**` (excluding dashboard) | Proxied to account-service                            |
| `/api/v1/transactions/**`                   | Proxied to transaction-service                        |
| `/api/v1/users/**`                          | Proxied to user-service                               |
| `/api/v1/auth/**`                           | Proxied to user-service (public, no auth required)    |

### Resilience

Every proxied route is wrapped with:

- **Circuit breaker** (Resilience4j) — opens after 50% failure rate over a 10-request sliding window, with a 10-second wait before half-open retry
- **Retry** — 2 automatic retries on `503 Service Unavailable`
- **Time limiter** — 3-second timeout per downstream call

### JWT Validation

The gateway validates every incoming JWT against Keycloak's JWKS endpoint before any request reaches a downstream service. Downstream services also validate JWTs independently, so a compromised gateway cannot bypass service-level authentication.

---

## Prerequisites

| Tool                | Version                                          |
|---------------------|--------------------------------------------------|
| Node.js             | 18+                                              |
| Angular CLI         | 18.x (`npm i -g @angular/cli`)                   |
| Keycloak            | 24+ (local or remote instance)                   |
| API Gateway         | Running on `http://localhost:8080` (dev default) |
| account-service     | Running on `http://localhost:8081`               |
| transaction-service | Running on `http://localhost:8083`               |

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd nexus-web-portal

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
# App runs at http://localhost:4200
```

**Start order for local development:**

1. Keycloak (`http://localhost:8180`)
2. account-service (`http://localhost:8081`)
3. transaction-service (`http://localhost:8083`)
4. API gateway (`http://localhost:8080`)
5. Angular dev server (`http://localhost:4200`)

account-service and transaction-service must be running before the gateway starts, as the gateway's `WebClient` beans resolve service URLs at startup.

---

## Environment Configuration

| File                                   | Purpose              |
|----------------------------------------|----------------------|
| `src/environments/environment.ts`      | Development settings |
| `src/environments/environment.prod.ts` | Production settings  |

**Development defaults (`environment.ts`):**

```ts
export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:8080',
};
```

All service URLs are intentionally absent from the Angular environment — the app only ever needs to know the gateway address. account-service and transaction-service URLs are internal concerns of the gateway.

---

## Authentication

Authentication is handled by **Keycloak** using the `check-sso` flow. The Keycloak client is initialized in `src/app/core/auth/keycloak-init.factory.ts`.

**Default Keycloak config (dev):**

```ts
{
  url: 'http://localhost:8180',
    realm
:
  'nexus',
    clientId
:
  'nexus-web-portal'
}
```

To use a different Keycloak instance, update these values in `keycloak-init.factory.ts`. You will also need to place a `silent-check-sso.html` file at the root of the app (already included at `src/silent-check-sso.html`).

**Auth guard:** All routes under the `ShellComponent` are protected by `authGuard`. Unauthenticated users are redirected to Keycloak login, then returned to `/dashboard` after sign-in.

**Token flow:**

1. User logs in via Keycloak → receives a signed JWT (5-minute lifetime in dev)
2. `authInterceptor` attaches the token as `Authorization: Bearer <token>` on every outgoing request
3. The gateway validates the token signature against Keycloak's JWKS endpoint
4. The gateway forwards the original `Authorization` header to downstream services
5. Each downstream service independently validates the token before processing the request
6. On a 401 response, `authInterceptor` attempts a silent token refresh before retrying once

---

## Project Structure

```
src/app/
│
├── core/
│   ├── auth/
│   │   ├── auth.guard.ts              # Route guard (Keycloak isLoggedIn check)
│   │   ├── auth.interceptor.ts        # Attaches bearer token; handles 401 refresh
│   │   ├── auth.service.ts            # Token helpers
│   │   └── keycloak-init.factory.ts
│   └── services/
│       ├── account.service.ts         # Account CRUD + getDashboard() aggregation call
│       ├── transaction.service.ts     # Paginated transactions + monthly summary
│       └── user.service.ts            # Registration
│
├── features/
│   ├── auth/
│   │   ├── login/                     # Keycloak redirect login page
│   │   └── register/                  # Self-registration form
│   ├── dashboard/
│   │   └── dashboard/                 # Accounts list, spending chart, quick transfer
│   ├── accounts/
│   │   └── account-detail/            # Single getDashboard() call → hero stats + ledger
│   └── transfer/                      # Full transfer form
│
├── layout/
│   ├── home/                          # Public landing page
│   ├── navbar/                        # Top navbar
│   ├── shell/                         # Authenticated layout shell with sidenav
│   └── sidebar/                       # Left navigation links
│
└── shared/
    └── shared.module.ts               # Re-exports common Angular Material modules
```

---

## Key Features

**Dashboard**

- Collapsible accounts list showing available balance, monthly deposits, and monthly withdrawals
- Monthly figures are fetched in parallel per account via `forkJoin` on `getMonthlySummary()`
- Quick transfer form (internal accounts)
- Spending donut chart (placeholder data — ready to wire to a real endpoint)
- Per-account "More" dropdown for statements, details, and transfer activity

**Account Detail**

- Single `getDashboard()` call to `GET /api/v1/accounts/{id}/dashboard` which returns account details, monthly summary, and paginated transactions in one response
- Hero header showing present balance, available balance, deposits this month, and withdrawals this month
- Full paginated transaction table with date, description, type, amount, and running balance
- Credit/debit colouring based on transaction direction relative to the viewed account
- Pagination-only reload on page changes — account header stays visible while transactions refresh

**Transfer**

- Source and destination account selection populated from the authenticated user's accounts
- Amount validation, transfer date picker, and optional note field

**Auth**

- Keycloak SSO with silent token refresh
- Bearer token injected automatically on every protected API call
- Self-registration flow that calls the API gateway directly

---

## Available Scripts

| Script          | Description                                  |
|-----------------|----------------------------------------------|
| `npm start`     | Start dev server at `http://localhost:4200`  |
| `npm run build` | Production build to `dist/nexus-web-portal/` |
| `npm run watch` | Development build with file watching         |
| `npm test`      | Run unit tests via Karma + Jasmine           |

---

## Running Tests

```bash
npm test
```

Tests run in a Chrome browser via Karma. Each component and service has a corresponding `.spec.ts` file generated alongside it.

---

## Themed Design System

Global CSS tokens are defined in `src/styles.scss` and consumed throughout all component stylesheets:

| Token                | Value                    | Usage                         |
|----------------------|--------------------------|-------------------------------|
| `--nexus-navy`       | `#060d1f`                | Page background               |
| `--nexus-navy-2`     | `#0a1628`                | Card / panel background       |
| `--nexus-gold`       | `#c9a055`                | Primary accent, CTAs          |
| `--nexus-gold-light` | `#e8c97a`                | Hover state for gold elements |
| `--nexus-white`      | `#f8f6f0`                | Primary text                  |
| `--nexus-muted`      | `rgba(248,246,240,0.55)` | Secondary / label text        |
| `--nexus-border`     | `rgba(201,160,85,0.15)`  | Card and input borders        |
| `--nexus-fd`         | Cormorant Garamond       | Display / heading font        |
| `--nexus-fb`         | Outfit                   | Body / UI font                |
