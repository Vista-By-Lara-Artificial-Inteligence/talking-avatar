// app/shopify.server.ts
import type { Session } from "@shopify/shopify-api";
import { shopifyApi } from "@shopify/shopify-api";
import { DeliveryMethod, WebhookValidationError } from "@shopify/shopify-api";

const requiredEnv = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "APP_URL"];
for (const k of requiredEnv) {
  if (!process.env[k]) throw new Error(`Missing required env: ${k}`);
}

// Derive hostName safely from APP_URL and DO NOT rely on HOST env.
// This avoids conflicts with runtimes that use HOST as a bind address.
const appUrl = process.env.APP_URL!;
const url = new URL(appUrl);
const hostName = url.host; // e.g. talking-avatar-vbl-snowy-cloud-3691.fly.dev

const apiVersion = "2024-07";

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  hostName,
  apiVersion,
  isEmbeddedApp: true,
});

// (Optional) GDPR webhook helpers as before; safe to keep or remove if unused
export async function registerGDPRWebhooks(session: Session) {
  const client = new shopify.clients.Rest({ session });
  await client.post({ path: "webhooks", data: { webhook: { topic: "customers/data_request", address: `${appUrl}/webhooks`, format: "json" } }, type: "json" });
  await client.post({ path: "webhooks", data: { webhook: { topic: "customers/redact",       address: `${appUrl}/webhooks`, format: "json" } }, type: "json" });
  await client.post({ path: "webhooks", data: { webhook: { topic: "shop/redact",            address: `${appUrl}/webhooks`, format: "json" } }, type: "json" });
}

export function verifyWebhookHmac(headers: Headers, rawBody: string) {
  try {
    const hmac = headers.get("X-Shopify-Hmac-Sha256") ?? "";
    return shopify.webhooks.validate({
      rawBody,
      rawRequest: { headers: Object.fromEntries(headers) },
      secret: process.env.SHOPIFY_API_SECRET!,
      hmac,
      deliveryMethod: DeliveryMethod.Http,
    });
  } catch (e) {
    if (e instanceof WebhookValidationError) return false;
    throw e;
  }
}
