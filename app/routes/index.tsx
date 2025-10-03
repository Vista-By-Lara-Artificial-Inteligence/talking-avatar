cat > app/routes/index.tsx <<'TSX'
import { useState } from "react";
import { useFetcher } from "@remix-run/react";

export default function Index() {
  const fetcher = useFetcher();
  const [text, setText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    fetcher.submit(form, { method: "post", encType: "application/json", action: "/api/render" });
  };

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>AI Avatar Talking by Vista</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>Enter text and generate a talking avatar preview.</p>

      <form onSubmit={submit}>
        <textarea
          name="text"
          rows={4}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type what you want the avatar to say..."
          style={{ width: "100%", padding: 12, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          type="submit"
          style={{ marginTop: 12, padding: "10px 16px", borderRadius: 6, border: "none", background: "#5c6ac4", color: "#fff", cursor: "pointer" }}
          disabled={fetcher.state !== "idle"}
        >
          {fetcher.state !== "idle" ? "Generating..." : "Generate"}
        </button>
      </form>

      {fetcher.state === "submitting" && <p style={{ marginTop: 12 }}>Working...</p>}
      {fetcher.data?.videoUrl && (
        <section style={{ marginTop: 24 }}>
          <h3>Preview</h3>
          <video src={fetcher.data.videoUrl} controls autoPlay style={{ width: "100%", borderRadius: 8 }} />
        </section>
      )}
    </main>
  );
}
TSX
