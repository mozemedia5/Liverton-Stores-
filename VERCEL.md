# Liverton on Vercel

This repository contains the Liverton React/Vite storefront and its serverless API entrypoint. Vercel builds the Vite client into `dist/public` and routes `/api/*` requests to `api/index.ts`, which exposes the tRPC, Shopify commerce, OAuth, storage, public catalog, and Hanna AI procedures.

## Project settings

Import the repository with the repository root as the Vercel project root. Keep the framework set to Vite or allow Vercel to detect it. The checked-in `vercel.json` defines the install, build, output, API, and SPA routing contract.

## Environment variables

The managed project intentionally does not create or commit `.env.example`; `VERCEL_ENV_TEMPLATE.txt` is the official names-only substitute. Add the variables listed there to the Vercel project for both Preview and Production. The existing Liverton WebDev values remain required for auth, database, Forge, and Shopify storefront operation.

The Firebase values are web configuration and may use the `VITE_` prefix because they are intentionally available to the browser. The optional dashboard banner variables are also client-readable and control the home banner without a code change:

| Variable | Purpose |
|---|---|
| `VITE_LIVERTON_BANNER_VIDEO_URL` | Optional video source for the video-ready dashboard banner |
| `VITE_LIVERTON_BANNER_POSTER_URL` | Optional poster image for the video banner |
| `VITE_LIVERTON_BANNER_TITLE` | Optional banner title override |
| `VITE_LIVERTON_BANNER_BODY` | Optional banner copy override |

Shopify Admin variables must remain server-only. Never prefix them with `VITE_`:

| Variable | Purpose |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | Storefront domain, such as `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN` | Storefront API access token used by the server-side commerce procedures |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Rotated Admin API token for future server-only Admin operations |
| `SHOPIFY_CLIENT_ID` | Shopify app client ID for server-side app operations |
| `SHOPIFY_API_SECRET` | Shopify app secret; server-only |

## Credential safety

Do not commit `.env`, `.env.local`, or any file containing real values. The repository contains variable names only. Any Shopify Admin token or app secret pasted into chat or another public location must be revoked and regenerated before use. The browser must never receive Shopify Admin credentials.

## Verification

Before connecting the repository to Vercel, run:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

After the first Vercel Preview deployment, verify the home page, direct deep links, Shopify product loading, cart/checkout handoff, Hanna AI, contact form, PWA install prompt, and `/api/public/catalog.json`. Then promote the verified Preview to Production.

The managed Manus deployment remains available at `https://livertonshop-mcsq3anr.manus.space`; Vercel is an external deployment target and may require platform-specific environment, serverless timeout, and database configuration adjustments.
