// app/routes/app._index.tsx
import * as React from "react";

const LIBRARY = [
  { id: "ava-1", url: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=800&auto=format", title: "Portrait A" },
  { id: "ava-2", url: "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?q=80&w=800&auto=format", title: "Portrait B" },
  { id: "ava-3", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format", title: "Portrait C" },
  { id: "ava-4", url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=800&auto=format", title: "Portrait D" },
];

export default function AdminPage() {
  const [tab, setTab] = React.useState<"upload" | "library">("upload");

  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [text, setText] = React.useState<string>("Hello! I’m your Talking Avatar demo.");
  const [voiceId, setVoiceId] = React.useState<string | undefined>(undefined);

  const [talkId, setTalkId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string>("idle");
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function uploadFile(f: File) {
    const fd = new FormData();
    fd.append("file", f, f.name);
    const res = await fetch("/api.upload", { method: "POST", body: fd });
    const j = await res.json();
    if (j?.url) return j.url as string;
    throw new Error(j?.error || "upload failed");
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("For now, please upload an IMAGE. Video support is coming soon.");
      e.currentTarget.value = "";
      return;
    }
    setBusy(true);
    try {
      const url = await uploadFile(f);
      setImageUrl(url);
    } catch (err: any) {
      alert(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  function usePoll(talkId: string | null) {
    React.useEffect(() => {
      if (!talkId) return;
      const t = setInterval(async () => {
        const r = await fetch(`/api.generate?id=${encodeURIComponent(talkId)}`);
        const j = await r.json();
        if (j.status === "done" && j.result_url) {
          setResultUrl(j.result_url);
          setStatus("done");
          clearInterval(t);
        } else if (j.status === "error") {
          setStatus("error: " + (j.error || "unknown"));
          clearInterval(t);
        } else {
          setStatus(j.status || "in_progress");
        }
      }, 1400);
      return () => clearInterval(t);
    }, [talkId]);
  }
  usePoll(talkId);

  async function onGenerate() {
    if (!imageUrl || !text.trim()) {
      alert("Please select an image (upload or from library) and enter text.");
      return;
    }
    setBusy(true);
    setStatus("creating…");
    setResultUrl(null);
    setTalkId(null);
    try {
      const r = await fetch("/api.generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, text, voiceId }),
      });
      const j = await r.json();
      if (j.id) {
        setTalkId(j.id);
        setStatus("in_progress");
      } else {
        setStatus("error: " + (j.error || "unknown"));
      }
    } catch (e: any) {
      setStatus("error: " + (e?.message || String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "20px auto", padding: "12px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4, fontWeight: 700 }}>Talking Avatar — Admin</h1>
      <p style={{ opacity: 0.75, marginTop: 0, marginBottom: 16 }}>
        Upload your own image or pick from the library, type a script, then generate a lip-synced video.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab("upload")} style={btn(tab === "upload")}>Upload</button>
        <button onClick={() => setTab("library")} style={btn(tab === "library")}>Library</button>
      </div>

      {tab === "upload" ? (
        <div style={card()}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={label()}>Upload image</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickFile} />
                {busy ? <span>Uploading…</span> : null}
              </div>
              {imageUrl ? (
                <div style={{ marginTop: 8 }}>
                  <img src={imageUrl} alt="uploaded" style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #eee" }} />
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{imageUrl}</div>
                </div>
              ) : null}
            </div>

            <div>
              <label style={label()}>Script text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                style={input()}
                placeholder="Type what you want the avatar to say…"
              />
            </div>

            <div>
              <label style={label()}>Voice (optional)</label>
              <select value={voiceId ?? ""} onChange={(e) => setVoiceId(e.target.value || undefined)} style={input()}>
                <option value="">Default</option>
                <option value="21m00Tcm4TlvDq8ikWAM">Warm Female</option>
                <option value="3H6s7Ff4wE2t8dSample">Bright Male</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={onGenerate} style={primary()} disabled={busy}>Generate</button>
              <span style={{ opacity: 0.8 }}>{status}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={card()}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {LIBRARY.map((a) => (
              <button key={a.id} onClick={() => { setImageUrl(a.url); setTab("upload"); }} style={tile()}>
                <img src={a.url} alt={a.title} style={{ width: "100%", height: 160, objectFit: "cover", borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />
                <div style={{ padding: 8, fontSize: 14 }}>{a.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {resultUrl ? (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: "8px 0" }}>Result</h3>
          <video src={resultUrl} controls style={{ width: "100%", borderRadius: 12, border: "1px solid #eee" }} />
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            <a href={resultUrl} target="_blank" rel="noreferrer">Open video</a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// styles
function btn(active: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid " + (active ? "#111827" : "#ddd"),
    background: active ? "#111827" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer"
  };
}
function card(): React.CSSProperties {
  return { border: "1px solid #eee", borderRadius: 16, padding: 16, background: "#fff" };
}
function label(): React.CSSProperties {
  return { display: "block", fontWeight: 600, marginBottom: 6 };
}
function input(): React.CSSProperties {
  return { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" };
}
function primary(): React.CSSProperties {
  return { padding: "10px 16px", borderRadius: 12, border: "0", background: "#111827", color: "white", cursor: "pointer" };
}
function tile(): React.CSSProperties {
  return { padding: 0, textAlign: "left", background: "#fff", border: "1px solid #eee", borderRadius: 12, cursor: "pointer" };
}
