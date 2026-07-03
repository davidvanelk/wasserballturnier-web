This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Docker Compose (Next.js + Matomo + Strapi)

From the repository root (`wasserballturnier-web`), start the full stack:

```bash
docker compose up -d --build
```

Services:

- Next.js app: `http://localhost:80`
- Matomo: `http://localhost:8080`
- Strapi via prefix: `http://localhost/cms`
- Strapi direct container port: `http://localhost:1337`
- Matomo database: `matomo-db`
- Strapi database: `strapi-db`

The compose file is in the repository root (`docker-compose.yml`).

## Tracking Setup (SSR + UTM + Cookieless)

Tracking is sent server-side from `middleware.ts` to Matomo via `matomo.php`:

- only for `GET` HTML page requests
- UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) are forwarded
- no client-side Matomo script and no tracking cookies are used

Environment variables used by SSR tracking:

- `MATOMO_URL` (default in compose: `http://matomo`)
- `MATOMO_SITE_ID` (default in compose: `1`)
- `MATOMO_TOKEN_AUTH` (optional)

Environment variables used by the sponsor SSR integration:

- `STRAPI_URL` (default in compose: `http://strapi:1337`)
- `STRAPI_PUBLIC_URL` (default in compose: `/cms`)

The sponsor carousel fetches its data from Strapi during SSR. Sponsor logo paths
are defined in JSON as Strapi upload URLs. Strapi resolves them to media
relations during boot, and the SSR layer expands the populated media URL against
`STRAPI_PUBLIC_URL` for the browser.

Locally, the Next.js app proxies `/cms/*` to the Strapi container so the same
prefix works both in Docker Compose and behind the Kubernetes ingress.

For production behind HTTPS, make sure `MATOMO_URL` points to your reachable Matomo URL and that reverse proxy headers are set correctly.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
