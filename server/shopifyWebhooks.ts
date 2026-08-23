import crypto from "node:crypto";
import { getFirebaseAdmin } from "./firebaseAdmin.js";

export type ShopifyWebhookResult = {
  duplicate: boolean;
  topic: string;
  webhookId: string;
};

function constantTimeBase64Equal(expected: string, received: string): boolean {
  try {
    const expectedBuffer = Buffer.from(expected, "base64");
    const receivedBuffer = Buffer.from(received, "base64");
    return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}

export function verifyShopifyWebhook(rawBody: Buffer, hmacHeader: string | undefined, secret: string): boolean {
  if (!hmacHeader || !secret) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  return constantTimeBase64Equal(digest, hmacHeader);
}

export async function processShopifyWebhook(input: {
  rawBody: Buffer;
  topic: string;
  webhookId: string;
  eventId?: string;
  triggeredAt?: string;
}): Promise<ShopifyWebhookResult> {
  const { firestore } = getFirebaseAdmin();
  const deliveryRef = firestore.collection("shopify_webhook_events").doc(input.webhookId);
  const syncRef = firestore.collection("shopify_sync").doc("catalog");
  const receivedAt = new Date();
  const payloadHash = crypto.createHash("sha256").update(input.rawBody).digest("hex");

  const duplicate = await firestore.runTransaction(async transaction => {
    const existing = await transaction.get(deliveryRef);
    if (existing.exists) return true;
    transaction.set(deliveryRef, {
      topic: input.topic,
      eventId: input.eventId ?? null,
      triggeredAt: input.triggeredAt ?? null,
      payloadHash,
      receivedAt,
    });
    transaction.set(syncRef, {
      topic: input.topic,
      webhookId: input.webhookId,
      eventId: input.eventId ?? null,
      triggeredAt: input.triggeredAt ?? null,
      updatedAt: receivedAt,
    }, { merge: true });
    return false;
  });

  return { duplicate, topic: input.topic, webhookId: input.webhookId };
}
