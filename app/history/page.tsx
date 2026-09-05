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

type Creation = {
  name: string;
  path: string;
  url: string;
  created_at: string;
  size: number | null;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteBusy, setFavoriteBusy] = useState("");
  const [preview, setPreview] = useState<Creation | null>(null);

  const supabase = createClient();

  async function loadData() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [historyResponse, creationsResponse, favoritesResponse] = await Promise.all([
      supabase
        .from("generation_history")
        .select("id,generator,prompt,result,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      fetch("/api/creations", { cache: "no-store" }),
      fetch("/api/favorites", { cache: "no-store" })
    ]);

    if (!historyResponse.error && historyResponse.data) {
      setItems(historyResponse.data);
    }

    if (creationsResponse.ok) {
      const data = await creationsResponse.json();
      setCreations(data.creations || []);
    }

    if (favoritesResponse.ok) {
      const data = await favoritesResponse.json();
      setFavorites(data.favorites || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function toolName(id: string) {
    const names: Record<string, string> = {
      caption: "✍️ Caption Instagram",
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

  async function toggleFavorite(path: string) {
    setFavoriteBusy(path);
    const isFavorite = favorites.includes(path);
    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Gagal mengubah favorit.");
        return;
      }
      setFavorites((current) =>
        isFavorite ? current.filter((item) => item !== path) : [...current, path]
      );
    } catch (error) {
      console.error(error);
      alert("Tidak dapat mengubah favorit.");
    } finally {
      setFavoriteBusy("");
    }
  }

  async function deleteCreation(path: string) {
    if (!confirm("Hapus gambar ini dari My Creations?")) return;

    setDeleting(path);
    try {
      const response = await fetch("/api/creations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Gagal menghapus gambar.");
        return;
      }

      setCreations((current) => current.filter((item) => item.path !== path));
    } catch (error) {
      console.error(error);
      alert("Tidak dapat menghapus gambar.");
    } finally {
      setDeleting("");
    }
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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 22,
            marginBottom: 20
          }}
        >
          <h1 style={{ marginTop: 0 }}>📚 My Creations</h1>
          <p style={{ color: "#64748b" }}>
            Semua hasil AI Photo dan konten yang pernah kamu buat dengan Gilang AI.
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
            ← Kembali ke Dashboard
          </a>
        </header>

        {loading && (
          <div style={{ background: "#fff", padding: 24, borderRadius: 18 }}>
            ⏳ Memuat My Creations...
          </div>
        )}

        {!loading && (
          <section style={{ marginBottom: 28 }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 22,
                marginBottom: 16
              }}
            >
              <h2 style={{ marginTop: 0 }}>📸 AI Photos</h2>
              <p style={{ color: "#64748b" }}>
                Hasil AI Photoshoot tersimpan aman di Supabase Storage.
              </p>
            </div>

            {creations.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  padding: 30,
                  borderRadius: 18,
                  textAlign: "center"
                }}
              >
                Belum ada hasil AI Photo yang tersimpan.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 16
                }}
              >
                {creations.map((item) => (
                  <article
                    key={item.path}
                    style={{
                      background: "#fff",
                      borderRadius: 18,
                      overflow: "hidden",
                      boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)"
                    }}
                  >
                    <button
                      onClick={() => setPreview(item)}
                      style={{
                        display: "block", width: "100%", padding: 0, border: 0, background: "transparent", cursor: "pointer"
                      }}
                      aria-label="Lihat gambar lebih besar"
                    >
                      <img
                        src={item.url}
                        alt="Hasil AI Photoshoot"
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                          display: "block"
                        }}
                      />
                    </button>
                    <div style={{ padding: 14 }}>
                      <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>
                        {new Date(item.created_at).toLocaleString("id-ID")}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => toggleFavorite(item.path)}
                          disabled={favoriteBusy === item.path}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: favorites.includes(item.path) ? "#fff7ed" : "#fff",
                            color: favorites.includes(item.path) ? "#ea580c" : "#475569",
                            fontSize: 14
                          }}
                        >
                          {favoriteBusy === item.path ? "..." : favorites.includes(item.path) ? "★ Favorit" : "☆ Favorit"}
                        </button>
                        <a
                          href={item.url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "9px 12px",
                            borderRadius: 10,
                            background: "#6d4aff",
                            color: "#fff",
                            textDecoration: "none",
                            fontSize: 14
                          }}
                        >
                          ⬇️ Download
                        </a>
                        <button
                          onClick={() => deleteCreation(item.path)}
                          disabled={deleting === item.path}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px solid #fecaca",
                            background: "#fff",
                            color: "#b91c1c",
                            fontSize: 14
                          }}
                        >
                          {deleting === item.path ? "Menghapus..." : "🗑️ Hapus"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {!loading && (
          <section>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 22,
                marginBottom: 16
              }}
            >
              <h2 style={{ marginTop: 0 }}>✍️ Riwayat AI Content</h2>
              <p style={{ color: "#64748b" }}>
                Riwayat teks tetap menggunakan tabel generation_history yang sudah ada.
              </p>
            </div>

            {items.length === 0 && (
              <div
                style={{
                  background: "#fff",
                  padding: 30,
                  borderRadius: 18,
                  textAlign: "center"
                }}
              >
                Belum ada riwayat generate konten.
              </div>
            )}

            {items.map((item) => (
              <article
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: 22,
                  marginBottom: 16
                }}
              >
                <h2 style={{ marginTop: 0 }}>{toolName(item.generator)}</h2>
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

                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
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
          </section>
        )}
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,.78)", zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: 900, width: "100%", maxHeight: "90vh", background: "#fff", borderRadius: 18, padding: 12, position: "relative" }}
          >
            <button
              onClick={() => setPreview(null)}
              style={{ position: "absolute", right: 12, top: 12, zIndex: 2, border: 0, borderRadius: 999, width: 38, height: 38, background: "rgba(255,255,255,.95)", fontSize: 20 }}
              aria-label="Tutup preview"
            >
              ×
            </button>
            <img
              src={preview.url}
              alt="Preview hasil AI Photoshoot"
              style={{ width: "100%", maxHeight: "84vh", objectFit: "contain", borderRadius: 12, display: "block" }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
