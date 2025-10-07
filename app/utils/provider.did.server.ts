// app/utils/provider.did.server.ts
const BASE = "https://api.d-id.com";

const keyRaw = process.env.DID_API_KEY;
if (!keyRaw) {
  // Don't throw at import-time in case we want the app to load without generation
  console.warn("DID_API_KEY not set; /api.generate will fail until provided.");
}
const credential = keyRaw?.includes(":") ? keyRaw : (keyRaw ? `${keyRaw}:` : "");
const AUTH = credential ? `Basic ${Buffer.from(credential).toString("base64")}` : "";

export type TalkStatus =
  | { status: "created" | "in_progress" }
  | { status: "done"; result_url: string }
  | { status: "error"; error: string };

export async function createTalkFromImage(opts: { imageUrl: string; text: string; voiceId?: string }) {
  if (!AUTH) throw new Error("Missing DID_API_KEY");
  const body: any = {
    source_url: opts.imageUrl,
    script: { type: "text", input: opts.text },
  };
  if (opts.voiceId) body.voice = { provider: "d-id", voice_id: opts.voiceId };

  const res = await fetch(`${BASE}/talks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: AUTH },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`D-ID create failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as { id: string };
}

export async function getTalk(id: string): Promise<TalkStatus> {
  if (!AUTH) throw new Error("Missing DID_API_KEY");
  const res = await fetch(`${BASE}/talks/${id}`, { headers: { Authorization: AUTH } });
  if (!res.ok) throw new Error(`D-ID get failed (${res.status}): ${await res.text()}`);
  const j = await res.json();
  if (j?.result_url) return { status: "done", result_url: j.result_url };
  if (j?.status === "error") return { status: "error", error: j?.error || "unknown" };
  return { status: j?.status || "in_progress" };
}
