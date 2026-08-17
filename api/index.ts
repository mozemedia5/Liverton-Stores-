import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { listProducts } from "../server/_core/shopify";
import { buildPublicCatalogResponse } from "../server/publicCatalog";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
app.get("/api/public/catalog.json", async (_req, res) => {
  try {
    const products = await listProducts({ first: 100 });
    res.json(buildPublicCatalogResponse(products));
  } catch (error) {
    console.error("[Public catalog] Failed to load:", error);
    res.status(503).json({ error: "Public catalog temporarily unavailable" });
  }
});
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

export default app;
