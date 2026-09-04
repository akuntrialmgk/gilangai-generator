"use client";

import { useState } from "react";

const tools = [
  {
    title: "Caption Instagram",
    placeholder: "Contoh: Buat caption untuk promo ayam geprek...",
  },
  {
    title: "Ide Konten",
    placeholder: "Contoh: Berikan 10 ide konten untuk UMKM kuliner...",
  },
  {
    title: "Hook Viral",
    placeholder: "Contoh: Buat hook viral untuk video TikTok...",
  },
  {
    title: "Judul Produk",
    placeholder: "Contoh: Buat judul produk untuk toko online...",
  },
  {
    title: "Deskripsi Produk",
    placeholder: "Contoh: Buat deskripsi produk yang menarik...",
  },
  {
    title: "Script TikTok",
    placeholder: "Contoh: Buat script video TikTok 30 detik...",
  },
  {
    title: "Iklan Facebook",
    placeholder: "Contoh: Buat teks iklan Facebook untuk produk saya...",
  },
  {
    title: "Promosi WhatsApp",
    placeholder: "Contoh: Buat pesan promosi WhatsApp...",
  },
  {
    title: "Bio Instagram",
    placeholder: "Contoh: Buat bio Instagram untuk bisnis saya...",
  },
  {
    title: "Nama Brand",
    placeholder: "Contoh: Berikan 20 nama brand yang unik...",
  },
];

export default function Home() {
  const [selected, setSelected] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  async function generate() {
  if (!prompt.trim()) {
    setResult("Silakan masukkan permintaan terlebih dahulu.");
    return;
  }

  setResult("⏳ GilangAI sedang membuat hasil...");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generator: "caption",
        values: {
          prompt: prompt,
          tool: tools[selected].title,
        },
      }),
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
  }
}

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-5 py-5">
          <h1 className="text-2xl font-bold text-indigo-600">
            GilangAI Generator
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            AI tools untuk membantu bisnis dan kreator membuat konten.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <aside className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-bold">AI Tools</h2>

            <div className="space-y-2">
              {tools.map((tool, index) => (
                <button
                  key={tool.title}
                  onClick={() => {
                    setSelected(index);
                    setResult("");
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    selected === index
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {tool.title}
                </button>
              ))}
            </div>
          </aside>

          <div className="md:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                {tools[selected].title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Masukkan kebutuhanmu dan buat konten dengan GilangAI.
              </p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={tools[selected].placeholder}
                className="mt-5 min-h-40 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-indigo-500"
              />

              <button
                onClick={generate}
                className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
              >
                ✨ Generate
              </button>

              {result && (
                <div className="mt-5 rounded-xl bg-slate-50 p-5">
                  <h3 className="font-bold">Hasil</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                    {result}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        © 2026 GilangAI Generator
      </footer>
    </main>
  );
}
