# Liverton on Vercel

This repository contains the Liverton React/Vite storefront and its serverless API entrypoint. Vercel builds the Vite client into `dist/public` and routes `/api/*` requests to `api/index.ts`, which exposes the tRPC, Shopify commerce, OAuth, storage, public catalog, and Hanna AI procedures.

## Project settings

Import the repository with the repository root as the Vercel project root. Keep the framework set to Vite or allow Vercel to detect it. The checked-in `vercel.json` defines the install, build, output, API, and SPA routing contract.

## Environment variables

The managed project intentionally does not create or commit `.env.example`; `VERCEL_ENV_TEMPLATE.txt` is the official names-only substitute. Add the variables listed there to the Vercel project for both Preview and Production. The storefront’s required shared contract is `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN`, and one browser-safe `VITE_FIREBASE_CONFIG_JSON` value. Firebase web configuration is intentionally browser-visible; never put a service-account private key in it. Homepage banner media and copy are not configured in Vercel. They are created, uploaded, drafted, and published in Admin-Store, then read from the shared backend.

Cloudinary variables belong in Admin-Store only: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLOUDINARY_UPLOAD_PRESET=liverton_admin_media`. Shopify Admin variables are optional future server-only settings and are not required for the current storefront. Never prefix Shopify Admin or Cloudinary secrets with `VITE_`.

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
