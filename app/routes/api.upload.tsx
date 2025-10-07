// app/routes/api.upload.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { saveUpload, uploadUrl } from "~/utils/uploads.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "file missing" }, { status: 400 });

    const id = await saveUpload(file);
    const url = uploadUrl(id);
    return json({ id, url });
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, { status: 500 });
  }
};
