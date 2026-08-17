# Liverton Store

A full-stack React/Vite storefront for Liverton, with Shopify Storefront API integration, Hanna AI support, a responsive purple-lavender and lime visual system, and PWA installation support.

## Local development

Install dependencies with `pnpm install --frozen-lockfile`. Run `pnpm dev` for the local server, `pnpm check` for TypeScript validation, `pnpm test` for Vitest, and `pnpm build` for the production build.

## Vercel deployment

This repository includes `vercel.json` and `api/index.ts` for Vercel. Import the repository as a Vite project with the repository root as the project root. The checked-in config builds the client to `dist/public`, rewrites `/api/*` to the serverless tRPC entrypoint, and falls through to the SPA entrypoint.

Before connecting production, add the required runtime and Shopify environment variables listed in `VERCEL.md` to Vercel Preview and Production environments. Do not commit `.env` files or secrets.

The same project remains previewable and hostable through Manus WebDev. Vercel is an external hosting target, so verify environment variables, serverless limits, database connectivity, and Shopify runtime behavior after the first Vercel preview.
