// app/shopify.server.ts
import type { Session } from "@shopify/shopify-api";
import { shopifyApi } from "@shopify/shopify-api";
import {
  DeliveryMethod,
  WebhookValidationError,
} from "@shopify/shopify-api";

const requiredEnv = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "HOST",
];
for (const k of requiredEnv) {
  if (!process.env[k]) {
    throw new Error(`Missing required env: ${k}`);
  }
}

/**
 * Pin the Admin API version explicitly to avoid breaking changes and
 * to remove any dependency on LATEST_API_VERSION.
 */
const apiVersion = "2024-07";

/**
 * Base Shopify API instance (no DB; useful utilities + REST/GraphQL clients).
 * You can build your own auth/session layer around this if needed.
 */
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  hostName: process.env.HOST!.replace(/^https?:\/\//, ""),
  apiVersion, // <-- fixed literal, NOT LATEST_API_VERSION
  isEmbeddedApp: true,
});

/**
 * Minimal GDPR webhook registrations (stubs returning 200).
 * Call registerGDPRWebhooks() once on boot/deploy if you keep a persistent store.
 * If you’re staying “mock-only” for review, you can keep these as-is.
 */
export async function registerGDPRWebhooks(session: Session) {
  const client = new shopify.clients.Rest({ session });

  // customer data request
  await client.post({
    path: "webhooks",
    data: {
      webhook: {
        topic: "customers/data_request",
        address: `${process.env.HOST}/webhooks`,
        format: "json",
      },
    },
    type: "json",
  });

  // customer data redaction
  await client.post({
    path: "webhooks",
    data: {
      webhook: {
        topic: "customers/redact",
        address: `${process.env.HOST}/webhooks`,
        format: "json",
      },
    },
    type: "json",
  });

  // shop redaction
  await client.post({
    path: "webhooks",
    data: {
      webhook: {
        topic: "shop/redact",
        address: `${process.env.HOST}/webhooks`,
        format: "json",
      },
    },
    type: "json",
  });
}

/**
 * Quick helper to verify webhook HMAC (optional but handy).
 * Use inside your /webhooks action to validate incoming requests.
 */
export function verifyWebhookHmac(headers: Headers, rawBody: string) {
  try {
    const hmac = headers.get("X-Shopify-Hmac-Sha256") ?? "";
    return shopify.webhooks.validate({
      rawBody,
      rawRequest: {
        headers: Object.fromEntries(headers),
      },
      secret: process.env.SHOPIFY_API_SECRET!,
      hmac,
      deliveryMethod: DeliveryMethod.Http,
    });
  } catch (e) {
    if (e instanceof WebhookValidationError) return false;
    throw e;
  }
}
