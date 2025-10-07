// app/utils/uploads.server.ts
import { randomUUID } from "node:crypto";

type Stored = { data: Buffer; contentType: string; filename?: string; createdAt: number };
const store = new Map<string, Stored>(); // ephemeral in-memory

export async function saveUpload(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const id = randomUUID();
  store.set(id, { data: buf, contentType, filename: file.name, createdAt: Date.now() });
  return id;
}

export function getUpload(id: string): Stored | undefined {
  return store.get(id);
}

// Build a public URL for the upload served by our own route
export function uploadUrl(id: string) {
  const base = process.env.APP_URL ?? "";
  return `${base?.replace(/\/$/, "")}/uploads/${id}`;
}

// Optional: small janitor to keep memory small (unused here)
// setInterval(() => { for (const [k,v] of store) if (Date.now()-v.createdAt>3600_000) store.delete(k) }, 10*60_000);
