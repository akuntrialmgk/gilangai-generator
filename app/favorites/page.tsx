"use client";

import { useEffect, useState } from "react";

type Creation = {
  name: string;
  path: string;
  url: string;
  created_at: string;
  size: number | null;
};

export default function FavoritesPage() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Creation | null>(null);
  const [removing, setRemoving] = useState("");

  async function loadFavorites() {
    setLoading(true);
    try {
      const [creationsResponse, favoritesResponse] = await Promise.all([
        fetch("/api/creations", { cache: "no-store" }),
        fetch("/api/favorites", { cache: "no-store" })
      ]);

      if (!creationsResponse.ok || !favoritesResponse.ok) {
        throw new Error("Gagal memuat favorit.");
      }

      const creationsData = await creationsResponse.json();
      const favoritesData = await favoritesResponse.json();
      const favoritePaths = new Set<string>(favoritesData.favorites || []);
      const favoriteCreations = (creationsData.creations || []).filter((item: Creation) =>
        favoritePaths.has(item.path)
      );
      setCreations(favoriteCreations);
    } catch (error) {
      console.error(error);
      setCreations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function removeFavorite(path: string) {
    setRemoving(path);
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Gagal menghapus favorit.");
        return;
      }
      setCreations((current) => current.filter((item) => item.path !== path));
    } catch (error) {
      console.error(error);
      alert("Tidak dapat menghapus favorit.");
    } finally {
      setRemoving("");
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
          <h1 style={{ marginTop: 0 }}>❤️ Favorit</h1>
          <p style={{ color: "#64748b" }}>
            Kumpulan hasil AI Photo yang kamu tandai sebagai favorit.
          </p>
          <a
            href="/history"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              background: "#6d4aff",
              color: "#fff",
              borderRadius: 10,
              textDecoration: "none"
            }}
          >
            ← Kembali ke My Creations
          </a>
        </header>

        {loading ? (
          <div style={{ background: "#fff", padding: 24, borderRadius: 18 }}>
            ⏳ Memuat Favorit...
          </div>
        ) : creations.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: 40,
              borderRadius: 18,
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 10 }}>❤️</div>
            <strong>Belum ada foto favorit</strong>
            <p style={{ color: "#64748b" }}>
              Buka My Creations lalu tekan ☆ Favorit pada gambar yang kamu sukai.
            </p>
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
                    display: "block",
                    width: "100%",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer"
                  }}
                >
                  <img
                    src={item.url}
                    alt="Foto AI favorit"
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
                      onClick={() => removeFavorite(item.path)}
                      disabled={removing === item.path}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1px solid #fed7aa",
                        background: "#fff7ed",
                        color: "#c2410c",
                        fontSize: 14
                      }}
                    >
                      {removing === item.path ? "Menghapus..." : "★ Hapus Favorit"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 100
          }}
        >
          <div onClick={(event) => event.stopPropagation()} style={{ maxWidth: 900, width: "100%" }}>
            <img
              src={preview.url}
              alt="Preview foto favorit"
              style={{ width: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 16 }}
            />
            <button
              onClick={() => setPreview(null)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: 12,
                border: 0,
                borderRadius: 10,
                background: "#fff",
                color: "#172033",
                fontWeight: 700
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
