const domain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "";
const callbackUrl = process.env.SHOPIFY_WEBHOOK_CALLBACK_URL ?? "";
const apiVersion = "2025-04";

if (!domain || !token || !callbackUrl) {
  console.error("Set SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, and SHOPIFY_WEBHOOK_CALLBACK_URL before registering webhooks.");
  process.exit(1);
}

const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;
const mutation = `#graphql
  mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $subscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $subscription) {
      webhookSubscription { id topic uri }
      userErrors { field message }
    }
  }
`;

const topics = [
  "PRODUCTS_CREATE",
  "PRODUCTS_UPDATE",
  "PRODUCTS_DELETE",
  "INVENTORY_LEVELS_UPDATE",
] as const;

for (const topic of topics) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        topic,
        subscription: { callbackUrl, format: "JSON" },
      },
    }),
  });
  const json = await response.json() as {
    data?: { webhookSubscriptionCreate?: { webhookSubscription?: { id: string; topic: string; uri: string } | null; userErrors: Array<{ field?: string[]; message: string }> } };
    errors?: Array<{ message: string }>;
  };
  if (!response.ok || json.errors?.length) {
    throw new Error(`${topic}: ${json.errors?.[0]?.message ?? `HTTP ${response.status}`}`);
  }
  const result = json.data?.webhookSubscriptionCreate;
  if (!result || result.userErrors.length) {
    throw new Error(`${topic}: ${result?.userErrors.map(error => error.message).join("; ") ?? "No response"}`);
  }
  console.log(`${topic}: ${result.webhookSubscription?.id ?? "already registered or unavailable"}`);
}
