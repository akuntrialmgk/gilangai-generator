"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

type HistoryItem = {
  id: number;
  generator: string;
  prompt: string;
  result: string;
  created_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadHistory() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("generation_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setItems(data);
      }

      setLoading(false);
    }

    loadHistory();
  }, []);

  function toolName(id: string) {
    const names: Record<string, string> = {
      caption: "📸 Caption Instagram",
      ideas: "💡 Ide Konten",
      hook: "🔥 Hook Viral",
      product_title: "🛍️ Judul Produk",
      product_description: "📝 Deskripsi Produk",
      tiktok_script: "🎵 Script TikTok",
      facebook_ads: "📣 Iklan Facebook",
      whatsapp_promo: "💬 Promosi WhatsApp",
      bio: "👤 Bio Instagram",
      brand: "✨ Nama Brand"
    };

    return names[id] || id;
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    alert("Hasil berhasil disalin!");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7fb",
        padding: 20,
        color: "#172033"
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 22,
            marginBottom: 20
          }}
        >
          <h1 style={{ marginTop: 0 }}>📚 Riwayat Generate</h1>
          <p style={{ color: "#64748b" }}>
            Semua konten yang pernah kamu buat dengan GilangAI.
          </p>

          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              background: "#6d4aff",
              color: "#fff",
              borderRadius: 10,
              textDecoration: "none"
            }}
          >
            ← Kembali ke Generator
          </a>
        </header>

        {loading && (
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 18
            }}
          >
            ⏳ Memuat riwayat...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 18,
              textAlign: "center"
            }}
          >
            Belum ada riwayat generate.
          </div>
        )}

        {!loading &&
          items.map((item) => (
            <article
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 22,
                marginBottom: 16
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {toolName(item.generator)}
              </h2>

              <p style={{ color: "#64748b" }}>
                {new Date(item.created_at).toLocaleString("id-ID")}
              </p>

              <div
                style={{
                  background: "#f8fafc",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12
                }}
              >
                <strong>Prompt:</strong>
                <div style={{ marginTop: 6 }}>{item.prompt}</div>
              </div>

              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.7
                }}
              >
                {item.result}
              </div>

              <button
                onClick={() => copyText(item.result)}
                style={{
                  marginTop: 16,
                  padding: "10px 15px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff"
                }}
              >
                📋 Copy Hasil
              </button>
            </article>
          ))}
      </div>
    </main>
  );
}
