// app/routes/api.generate.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createTalkFromImage, getTalk } from "~/utils/provider.did.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { imageUrl, text, voiceId } = await request.json();
    if (!imageUrl || !text) return json({ error: "imageUrl and text required" }, { status: 400 });
    const { id } = await createTalkFromImage({ imageUrl, text, voiceId });
    return json({ id });
  } catch (e: any) {
    return json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "id required" }, { status: 400 });
  try {
    const st = await getTalk(id);
    return json(st);
  } catch (e: any) {
    return json({ status: "error", error: String(e?.message || e) }, { status: 500 });
  }
}
