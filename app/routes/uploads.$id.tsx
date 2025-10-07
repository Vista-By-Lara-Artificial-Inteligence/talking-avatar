// app/routes/uploads.$id.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUpload } from "~/utils/uploads.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id!;
  const rec = getUpload(id);
  if (!rec) return new Response("Not found", { status: 404 });
  return new Response(rec.data, {
    status: 200,
    headers: { "Content-Type": rec.contentType, "Cache-Control": "no-store" },
  });
};
