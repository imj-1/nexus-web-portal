# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`nexus-web-portal` is the Angular 18 (standalone components) frontend of the Nexus banking system. It is one of several sibling repos (api-gateway, account-service, transaction-service, user-service, Keycloak) — this repo only contains the Angular client; do not assume backend source is available here.

## Commands

```bash
npm install          # install dependencies
npm start            # ng serve — dev server at http://localhost:4200
npm run build        # ng build — production build to dist/nexus-web-portal/ (fileReplacements swap in environment.prod.ts)
npm run watch        # ng build --watch --configuration development
npm test             # ng test — Karma + Jasmine, runs in Chrome
```

Run a single test file/suite (Karma doesn't take a file path directly — filter with `--include` or narrow the spec's `describe`/`it` to `fdescribe`/`fit`):

```bash
ng test --include='**/account-detail.component.spec.ts'
```

There is no configured lint script in `package.json` (no `ng lint` / ESLint setup present) — don't assume one exists.

## Architecture

**Stack:** Angular 18 standalone components (no NgModules except the leftover `shared` folder), Angular Material 18, RxJS for state (no NgRx/Akita), SCSS with CSS custom properties as a design-token system, Keycloak (`keycloak-angular` / `keycloak-js`) for auth, Angular CLI's `application` builder (esbuild-based, not classic webpack).

**Routing / shell pattern** (`src/app/app.routes.ts`): Public routes (`''` → home, `auth/register`, `auth/verify-email-sent`) render standalone. All other routes are children of `ShellComponent` (sticky navbar + sidenav) and are gated by `authGuard` (`src/app/core/auth/auth.guard.ts`), which redirects to Keycloak login if not authenticated. Everything is lazy-loaded via `loadComponent`.

**Auth flow:**
- Keycloak is initialized as an `APP_INITIALIZER` in `app.config.ts` via `initializeKeycloak` (`src/app/core/auth/keycloak-init.factory.ts`), using the `check-sso` flow and `silent-check-sso.html` (at `src/silent-check-sso.html`, must be served at app root).
- `authInterceptor` (`src/app/core/auth/auth.interceptor.ts`) is a functional `HttpInterceptorFn` registered via `provideHttpClient(withInterceptors([...]))`. It attaches `Authorization: Bearer <token>` to every request except URLs matching `PUBLIC_URLS` (currently just `/api/v1/auth/register`). On a 401 it calls `keycloak.updateToken(30)` and retries once; if refresh fails it forces `keycloak.login()`.
- Keycloak realm/client config lives in `src/environments/environment.ts` (`keycloakUrl`, `keycloakRealm`, `keycloakClientId`), not hardcoded in the factory.

**Backend communication:** The app talks *only* to the API gateway — it never calls account-service/transaction-service/user-service directly. The gateway base URL is `environment.apiGatewayUrl`:
- Dev (`src/environments/environment.ts`): `http://localhost:8060`
- Prod (`src/environments/environment.prod.ts`): a deployed HTTPS host

Services under `src/app/core/services/` each own one API surface and build their base URL as `${environment.apiGatewayUrl}/api/v1/...`:
- `account.service.ts` — account CRUD plus `getDashboard(accountId, page, size)`, a single call to the gateway's BFF-aggregated `GET /api/v1/accounts/{id}/dashboard` endpoint (returns account details + monthly summary + paginated transactions in one response, avoiding client-side fan-out).
- `transaction.service.ts` — `transfer()`, paginated `getByAccountId()`, and `getMonthlySummary()` for per-account deposit/withdrawal totals; also defines the shared `TransactionDTO`/`Page<T>`/`AccountMonthlySummaryDTO` types consumed by `account.service.ts`.
- `user.service.ts` — `register()` and `resendVerification()` against `/api/v1/auth`.

When adding a new API call, follow this pattern: a `providedIn: 'root'` service under `core/services`, a `base` URL built from `environment.apiGatewayUrl`, and typed request/response interfaces colocated in the same file (there's no separate `models/` directory).

**Folder structure:**
```
src/app/
├── core/
│   ├── auth/            # guard, interceptor, Keycloak init factory
│   └── services/        # one service per gateway API surface (account/transaction/user)
├── features/             # routed feature components, one subfolder per route
│   ├── auth/             # login, register, verify-email-sent
│   ├── dashboard/
│   ├── accounts/         # account-detail, account-onboarding (product signup flow)
│   ├── products/         # savings-accounts (marketing/product page)
│   └── transfer/
├── layout/               # home (public landing), navbar, shell (authed layout), sidebar
└── shared/               # demo-banner component, account-type.util.ts (product-type → accountType mapping)
```
Note: despite the name, `shared/` has no `SharedModule` — everything is a standalone component/util imported directly where needed.

**Notable non-obvious pieces:**
- `demo-banner` (`src/app/shared/demo-banner/demo-banner.component.ts`) renders a dismissible "this is a demo, not a real bank" disclaimer — this is a portfolio/demo project, not a production banking app.
- `account-type.util.ts` maps onboarding URL segments (`basic-savings`, `high-yield-savings`, `cd`) to the backend's `accountType` enum values used by `account-onboarding`.
- `AccountDTO.accountType` / `CreateAccountRequest.accountType` union: `'CHECKING' | 'BASIC_SAVINGS' | 'HIGH_YIELD_SAVINGS' | 'CERTIFICATE_OF_DEPOSIT' | 'MONEY_MARKET'` — keep this in sync across `account.service.ts` if the backend enum changes.
- Dashboard per-account monthly stats are fetched in parallel with `forkJoin` over `transaction.service.getMonthlySummary()`; account-detail instead uses the single aggregated `getDashboard()` call.

**Design tokens** (`src/styles.scss`, consumed by component stylesheets): CSS custom properties prefixed `--nexus-*` (e.g. `--nexus-navy`, `--nexus-gold`, `--nexus-white`, `--nexus-border`) plus font tokens `--nexus-fd` (Cormorant Garamond, display) and `--nexus-fb` (Outfit, body). Reuse these instead of hardcoding colors/fonts in new components.

## Local dev prerequisites

Full end-to-end functionality requires sibling services running (not in this repo): Keycloak (`8180`), account-service (`8081`), transaction-service (`8083`), and the API gateway (`8060` in this repo's `environment.ts`, though the README documents `8080` — trust `environment.ts` if they disagree). Start order matters: Keycloak → account-service/transaction-service → gateway → `npm start`.
