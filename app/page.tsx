"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

const tools = [
  ["caption", "📸", "Caption Instagram"],
  ["ideas", "💡", "Ide Konten"],
  ["hook", "🔥", "Hook Viral"],
  ["product_title", "🛍️", "Judul Produk"],
  ["product_description", "📝", "Deskripsi Produk"],
  ["tiktok_script", "🎵", "Script TikTok"],
  ["facebook_ads", "📣", "Iklan Facebook"],
  ["whatsapp_promo", "💬", "Promosi WhatsApp"],
  ["bio", "👤", "Bio Instagram"],
  ["brand", "✨", "Nama Brand"]
];

export default function Home() {
  const [selected, setSelected] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (data) {
        setCredits(data.credits);
      }
    }

    loadUser();
  }, []);

  const tool = tools[selected];

  async function generate() {
    if (!prompt.trim()) {
      setResult("Silakan masukkan kebutuhanmu terlebih dahulu.");
      return;
    }

    setLoading(true);
    setResult("⏳ GilangAI sedang membuat hasil...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          generator: tool[0],
          values: {
            prompt
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(`❌ ${data.error || "Gagal membuat konten."}`);
        return;
      }

      setResult(data.result || "Tidak ada hasil dari AI.");

      if (typeof data.credits === "number") {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error(error);
      setResult("❌ Tidak dapat terhubung ke AI. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (result) {
      await navigator.clipboard.writeText(result);
      alert("Hasil berhasil disalin!");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7fb",
        color: "#172033",
        padding: 20
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 22,
            marginBottom: 20,
            boxShadow: "0 4px 18px rgba(0,0,0,.06)"
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32 }}>
            🤖 GilangAI
          </h1>

          <p style={{ color: "#64748b", marginBottom: 0 }}>
            AI Generator untuk bisnis, UMKM & kreator
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              marginTop: 14
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                background: "#f1edff",
                color: "#6d4aff",
                fontWeight: "bold"
              }}
            >
              🪙 Kredit: {credits === null ? "..." : credits}
            </div>

            <a
              href="/history"
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                background: "#fff",
                color: "#6d4aff",
                border: "1px solid #6d4aff",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              📚 Riwayat
            </a>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center"
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontSize: 14
              }}
            >
              👤 {userEmail}
            </span>

            <button
              onClick={logout}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                border: "1px solid #fecaca",
                background: "#fff",
                color: "#dc2626",
                fontWeight: "bold"
              }}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        <section
          style={{
            background: "linear-gradient(135deg,#eee9ff,#fff)",
            borderRadius: 18,
            padding: 24,
            marginBottom: 20
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Selamat datang kembali! 👋
          </h2>

          <p style={{ color: "#64748b", marginBottom: 0 }}>
            Pilih AI Tools dan buat konten berkualitas dalam hitungan detik.
          </p>
        </section>

        <h2>AI Tools</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(170px,1fr))",
            gap: 12
          }}
        >
          {tools.map((item, index) => (
            <button
              key={item[0]}
              onClick={() => {
                setSelected(index);
                setResult("");
              }}
              style={{
                padding: 16,
                textAlign: "left",
                borderRadius: 14,
                border:
                  selected === index
                    ? "2px solid #6d4aff"
                    : "1px solid #e2e8f0",
                background:
                  selected === index
                    ? "#f1edff"
                    : "#fff"
              }}
            >
              <div style={{ fontSize: 26 }}>
                {item[1]}
              </div>

              <strong>{item[2]}</strong>
            </button>
          ))}
        </div>

        <section
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 22,
            marginTop: 20,
            boxShadow: "0 4px 18px rgba(0,0,0,.06)"
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {tool[1]} {tool[2]}
          </h2>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Contoh: buat ${String(
              tool[2]
            ).toLowerCase()} untuk bisnis ayam geprek`}
            rows={5}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              resize: "vertical"
            }}
          />

          <button
            onClick={generate}
            disabled={loading}
            style={{
              marginTop: 12,
              padding: "13px 20px",
              border: 0,
              borderRadius: 10,
              background:
                loading ? "#94a3b8" : "#6d4aff",
              color: "#fff",
              fontWeight: "bold"
            }}
          >
            {loading
              ? "⏳ Membuat..."
              : "✨ Generate"}
          </button>
        </section>

        {result && (
          <section
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 22,
              marginTop: 20,
              boxShadow: "0 4px 18px rgba(0,0,0,.06)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Hasil
              </h2>

              <button
                onClick={copyResult}
                style={{
                  padding: "8px 12px",
                  borderRadius: 9,
                  border: "1px solid #cbd5e1",
                  background: "#fff"
                }}
              >
                📋 Copy
              </button>
            </div>

            <div
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7
              }}
            >
              {result}
            </div>
          </section>
        )}

        <section
          style={{
            marginTop: 20,
            padding: 24,
            borderRadius: 18,
            background:
              "linear-gradient(135deg,#6d4aff,#9b7cff)",
            color: "#fff"
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            👑 GilangAI Premium
          </h2>

          <p>
            Akses fitur AI lebih lengkap dan produktivitas lebih tinggi.
          </p>

          <button
            style={{
              padding: "11px 18px",
              border: 0,
              borderRadius: 10,
              background: "#fff",
              color: "#6d4aff",
              fontWeight: "bold"
            }}
          >
            Upgrade
          </button>
        </section>

        <footer
          style={{
            textAlign: "center",
            padding: "28px 0",
            color: "#64748b"
          }}
        >
          © 2026 GilangAI Generator
        </footer>
      </div>
    </main>
  );
}
