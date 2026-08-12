# AGENTS.md

## Project overview

This repository contains the public website, its CMS, and the production configuration:

- `wasserball-public-web/`: the public website, built with Next.js 16, React 19, and TypeScript.
- `wasserball-strapi/`: the Strapi 5 project that provides the CMS foundation for the website. It contains content types, APIs, tournament logic, and seed data.
- `docker-compose.yml`: the local full stack consisting of the website, Strapi, MariaDB, Matomo, and Traefik.
- `gitops/`: Kubernetes, Kustomize, and Argo CD configuration for production.

Keep changes limited to the smallest affected area. Whenever content types, API responses, relations, media URLs, or routes change, verify the contracts between Strapi and the public website together.

## Git workflow

- Do not create or use Git worktrees.
- Use feature branches exclusively for changes. Creating this `AGENTS.md` on `main` is explicitly exempted.
- Do not overwrite or revert existing changes unrelated to the task.
- Do not commit secrets, `.env` files, credentials, or generated build artifacts.

## Local development

Always install dependencies with `npm ci` using the existing lockfiles. Run commands for a subproject from its directory.

### Public website

```sh
cd wasserball-public-web
npm ci
npm run dev
```

The local website is available at `http://localhost:3000` by default. Relevant environment variables include `STRAPI_URL`, `STRAPI_PUBLIC_URL`, `MATOMO_URL`, `MATOMO_SITE_ID`, and optionally `MATOMO_TOKEN_AUTH`.

### Strapi

```sh
cd wasserball-strapi
npm ci
npm run develop
```

Strapi uses MariaDB and is configured through `DATABASE_*` variables and the standard Strapi secrets. Never copy development or default secrets into production manifests.

### Full Docker stack

Start the stack from the repository root:

```sh
docker compose up --build
```

This builds the images and starts the development environment. The website is served through Traefik at `http://localhost`, Strapi at `http://localhost/cms`, and Matomo at `http://localhost:8080`. Add `-d` to run the stack in the background.

## Implementation rules

### Type safety

- Keep TypeScript changes strictly typed. Do not introduce `any`, unchecked non-null assertions, or broad casts that hide contract mismatches.
- Model API payloads, content-type values, phases, statuses, and nullable relations explicitly. Narrow unknown external data at framework boundaries before using it.
- Treat TypeScript errors as implementation errors; do not silence them with casts. Run the applicable type check or build before handoff.

### Website

- Preserve the existing Next.js App Router structure under `app/`.
- Localized pages live under `app/[locale]/`. Keep user-facing text consistent across all existing locale files (`de`, `en`, and `nl`).
- Place reusable UI in `lib/components/` and follow the existing MUI and styling conventions.
- Encapsulate server-side Strapi access in the existing modules under `lib/strapi/`.
- Preserve the `/cms` prefix and the distinction between the internal `STRAPI_URL` and browser-facing `STRAPI_PUBLIC_URL`.

### Strapi and migrations

- Strapi migrations and schema changes must be stable and always backward-compatible.
- Do not remove or rename existing fields, relations, enum values, API routes, or response shapes, and do not change their meaning.
- Introduce new fields as optional or with a safe default. Existing records and older website versions must continue to work during a rolling deployment.
- Keep data changes additive and repeatable. Migrations, bootstrap logic, and seeds must be idempotent and work with both empty and populated databases.
- Avoid destructive conversions. If something must be replaced, add the new field or API, migrate data compatibly, support both versions during the transition, and remove the old model only in a later, explicitly approved change.
- Handle both existing and missing values safely for relations and media.
- Changes to `src/seed/sponsors.json` and the boot-time seeding logic must not unintentionally delete or damage manually maintained data.
- Validate changes against MariaDB, the production database path. Do not rely on SQLite-specific behavior.

### GitOps and deployment

- Keep changes under `gitops/` declarative and follow the existing base and overlay structure.
- Secret examples may contain placeholders only. Real secrets must not be committed.
- Keep the public `/cms` path, Traefik prefix stripping, and Strapi's `PUBLIC_URL=/cms` configuration consistent.
- Do not unintentionally change image names or the Argo CD Image Updater `latest` and digest workflow.

## Verification

Run at least the applicable checks for every change:

```sh
cd wasserball-public-web
npm run lint
npm run build
```

```sh
cd wasserball-strapi
npm run build
```

For changes affecting the full stack, also run:

```sh
docker compose config
docker compose up --build
```

For GitOps changes, also run one of the following when the corresponding tool is installed:

```sh
kustomize build gitops/overlays/prod
# or
kubectl kustomize gitops/overlays/prod
```

Neither `package.json` currently defines an automated test script. For changes to tournament logic, Strapi lifecycles, generator endpoints, or data migrations, add focused tests or verify the relevant behavior manually and reproducibly. At handoff, state which checks were actually run and note any limitations.
