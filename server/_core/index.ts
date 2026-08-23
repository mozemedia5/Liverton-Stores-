import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { serveStatic, setupVite } from "./vite.js";
import { listProducts } from "./shopify.js";
import { buildPublicCatalogResponse } from "../publicCatalog.js";
import { processShopifyWebhook, verifyShopifyWebhook } from "../shopifyWebhooks.js";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Shopify requires HMAC verification against the raw request body. Keep this
  // endpoint before JSON parsing so the signature can be verified safely.
  app.post("/api/shopify/webhooks", express.raw({ type: "*/*", limit: "2mb" }), async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? "");
    const valid = verifyShopifyWebhook(rawBody, req.header("X-Shopify-Hmac-Sha256"), process.env.SHOPIFY_WEBHOOK_SECRET ?? process.env.SHOPIFY_API_SECRET ?? "");
    if (!valid) {
      res.status(401).json({ error: "Invalid Shopify webhook signature" });
      return;
    }
    const webhookId = req.header("X-Shopify-Webhook-Id");
    const topic = req.header("X-Shopify-Topic") ?? "unknown";
    if (!webhookId) {
      res.status(400).json({ error: "Missing Shopify webhook ID" });
      return;
    }
    try {
      const result = await processShopifyWebhook({
        rawBody,
        topic,
        webhookId,
        eventId: req.header("X-Shopify-Event-Id") ?? undefined,
        triggeredAt: req.header("X-Shopify-Triggered-At") ?? undefined,
      });
      res.status(200).json({ ok: true, duplicate: result.duplicate });
    } catch (error) {
      console.error("[Shopify webhook] Processing failed", { topic, webhookId, error });
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/public/catalog.json", async (_req, res) => {
    try {
      const products = await listProducts({ first: 100 });
      res.json(buildPublicCatalogResponse(products));
    } catch (error) {
      console.error("[Public catalog] Failed to load:", error);
      res.status(503).json({ error: "Public catalog temporarily unavailable" });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
