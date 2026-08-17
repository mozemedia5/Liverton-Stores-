# Liverton on Vercel

This repository contains the Liverton React/Vite storefront and its serverless API entrypoint. Vercel builds the Vite client into `dist/public` and routes `/api/*` requests to `api/index.ts`, which exposes the tRPC, Shopify commerce, OAuth, storage, and Hanna AI procedures.

## Vercel project settings

The checked-in `vercel.json` defines the build command, pnpm install command, Vite output directory, and SPA/API rewrites. Import the repository into Vercel with the repository root as the project root and leave the framework detected as Vite.

## Required environment variables

Add the values from the Liverton WebDev project to the Vercel project environment settings for Preview and Production. The runtime requires `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY`, `SHOPIFY_STORE_DOMAIN`, and `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN`. Add `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` only if analytics is enabled.

Never commit `.env` files or storefront/admin secrets. Shopify Admin operations remain outside the deployed browser bundle; the serverless API uses only the Storefront token at runtime.

## Local verification

Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, and `pnpm build` before connecting the repository to Vercel. The app is also hosted and previewable through Manus WebDev; Vercel is an external deployment target and may require platform-specific environment, serverless timeout, and database configuration adjustments.
