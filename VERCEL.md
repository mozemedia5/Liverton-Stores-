# Liverton on Vercel

This repository contains the Liverton React/Vite storefront and its serverless API entrypoint. Vercel builds the Vite client into `dist/public` and routes `/api/*` requests to `api/index.ts`, which exposes the tRPC, Firebase-backed application data, Shopify commerce, Cloudinary integration, public catalog, contact, and Hanna support procedures.

## Project settings

Import the repository with the repository root as the Vercel project root. Keep the framework set to Vite or allow Vercel to detect it. The checked-in `vercel.json` defines the install, build, output, API, and SPA routing contract.

## Environment variables

The managed project intentionally does not create or commit `.env.example`; `VERCEL_ENV_TEMPLATE.txt` is the official contract. Add the required variables to both Preview and Production. The Firebase web configuration belongs in `VITE_FIREBASE_CONFIG_JSON`; the Firebase service-account JSON belongs in the server-only `FIREBASE_SERVICE_ACCOUNT_JSON`. Shopify uses `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN`. Hanna uses the server-only `GEMINI_API_KEY` and optionally `HANNA_GEMINI_MODEL` (default `gemini-2.5-flash`). Homepage banner media and copy are created, uploaded, drafted, and published in Admin-Store through Firebase and Cloudinary, then read by the storefront.

In Firebase Console, use **Project settings → Your apps → Web app configuration**. Put the Firebase fields `apiKey`, `authDomain`, `databaseURL` (if enabled), `projectId`, `storageBucket`, `messagingSenderId`, and `appId` together as the one JSON value for `VITE_FIREBASE_CONFIG_JSON`. Firebase web configuration is browser-safe; never put a Firebase service-account private key in it. Cloudinary variables belong in Admin-Store only: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLOUDINARY_UPLOAD_PRESET=liverton_admin_media`. Shopify Admin variables are optional future server-only settings and are not required for the current storefront. Never prefix Shopify Admin or Cloudinary secrets with `VITE_`.

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

The production deployment uses Vercel with Firebase as the application backend, Shopify as the commerce source of truth, and Cloudinary as the media store.
