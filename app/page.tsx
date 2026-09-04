"use client";

import { useState } from "react";

const tools = [
  {
    id: "caption",
    title: "Caption Instagram",
    icon: "📸",
    description: "Buat caption Instagram yang menarik"
  },
  {
    id: "ideas",
    title: "Ide Konten",
    icon: "💡",
    description: "Temukan ide konten kreatif"
  },
  {
    id: "hook",
    title: "Hook Viral",
    icon: "🔥",
    description: "Buat hook yang bikin berhenti scrolling"
  },
  {
    id: "product_title",
    title: "Judul Produk",
    icon: "🛍️",
    description: "Judul produk yang menarik"
  },
  {
    id: "product_description",
    title: "Deskripsi Produk",
    icon: "📝",
    description: "Deskripsi produk yang meyakinkan"
  },
  {
    id: "tiktok_script",
    title: "Script TikTok",
    icon: "🎵",
    description: "Script video TikTok siap pakai"
  },
  {
    id: "facebook_ads",
    title: "Iklan Facebook",
    icon: "📣",
    description: "Copywriting iklan Facebook"
  },
  {
    id: "whatsapp_promo",
    title: "Promosi WhatsApp",
    icon: "💬",
    description: "Teks promosi WhatsApp"
  },
  {
    id: "bio",
    title: "Bio Instagram",
    icon: "👤",
    description: "Bio Instagram profesional"
  },
  {
    id: "brand",
    title: "Nama Brand",
    icon: "✨",
    description: "Cari nama brand yang unik"
  }
];

export default function Home() {
  const [selected, setSelected] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const currentTool = tools[selected];

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
          generator: currentTool.id,
          values: {
            prompt: prompt
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(`❌ ${data.error || "Gagal membuat konten."}`);
        return;
      }

      setResult(data.result || "Tidak ada hasil dari AI.");
    } catch (error) {
      console.error(error);
      setResult(
        "❌ Tidak dapat terhubung ke AI. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7fb",
        color: "#172033",
        padding: "24px"
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        {/* HEADER */}
        <header
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px"
                }}
              >
                🤖 GilangAI
              </h1>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#64748b"
                }}
              >
                AI Generator untuk bisnis, UMKM & kreator
              </p>
            </div>

            <button
              style={{
                border: 0,
                borderRadius: "12px",
                padding: "12px 18px",
                background: "#6d4aff",
                color: "white",
                fontWeight: "bold"
              }}
            >
              👑 Upgrade
            </button>
          </div>
        </header>

        {/* WELCOME */}
        <section
          style={{
            background:
              "linear-gradient(135deg, #eee9ff, #ffffff)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px"
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Selamat datang kembali! 👋
          </h2>

          <p style={{ color: "#64748b" }}>
            Pilih AI Tools dan
