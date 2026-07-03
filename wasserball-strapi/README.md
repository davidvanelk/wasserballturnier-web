# Wasserball Strapi

This Strapi application models the sponsor data used by the public website.
The project is configured in TypeScript and follows Strapi's supported migration
path for existing applications.

## TypeScript setup

- Root server TypeScript config: `tsconfig.json`
- Admin TypeScript config: `src/admin/tsconfig.json`
- Strapi config, bootstrap, and sponsor API code are implemented as `.ts` files
- Content-type schemas remain JSON, as required by Strapi

## Sponsor model

The `Sponsor` collection type contains:

- `sponsor`
- `logo` (single media relation)
- `alt`
- `url`
- `selector`
- `tokenMultiplier`
- `sortOrder`
- `active`

On boot, the app syncs the existing sponsor configuration into Strapi from
`src/seed/sponsors.json`. The `logo` values in that file are upload URLs from the
Strapi Media Library, and those values are resolved to real upload records so
the sponsor entries store a media relation instead of a plain string path.

Seeding is controlled by `SEED_SPONSORS_ON_BOOT` and is enabled in the
Kubernetes production config so a fresh production database is populated during
Strapi startup.
