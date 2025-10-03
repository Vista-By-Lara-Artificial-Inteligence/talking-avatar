// app/routes/index.tsx

import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Avatar Talking by Vista" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
  ];
};

export default function Index() {
  const fetcher = useFetcher();
  const [previewUrl, setPreviewUrl] = useState("");
  const [text, setText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    fetcher.submit(form, { method: "post", encType: "multipart/form-data", action: "/api/render" });
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>AI Avatar Talking by Vista</h1>
      <form method="post" onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          Upload Avatar Image:
          <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} required />
        </label>
        {previewUrl && <img src={previewUrl} alt="Avatar Preview" style={{ marginTop: 10, maxWidth: "100%" }} />}
        <label style={{ display: "block", marginTop: 20 }}>
          Text to Speak:
          <textarea name="text" value={text} onChange={(e) => setText(e.target.value)} rows={4} style={{ width: "100%" }} required />
        </label>
        <button type="submit" style={{ marginTop: 20, padding: "10px 20px" }}>
          Generate Talking Avatar
        </button>
      </form>

      {fetcher.state === "submitting" && <p>🌀 Generating...</p>}
      {fetcher.data?.videoUrl && (
        <div style={{ marginTop: 30 }}>
          <h2>Preview:</h2>
          <video src={fetcher.data.videoUrl} controls autoPlay style={{ maxWidth: "100%" }} />
        </div>
      )}
    </main>
  );
}
