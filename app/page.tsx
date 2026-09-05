"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../utils/supabase/client";

const contentTools = [
  ["caption", "✍️", "Caption Instagram", "Buat caption yang siap posting"],
  ["ideas", "💡", "Ide Konten", "Temukan ide konten baru"],
  ["hook", "🔥", "Hook Viral", "Hook untuk menghentikan scroll"],
  ["product_title", "🛍️", "Judul Produk", "Judul marketplace yang menarik"],
  ["product_description", "📝", "Deskripsi Produk", "Deskripsi produk yang menjual"],
  ["tiktok_script", "🎬", "Script TikTok", "Script video 30–60 detik"],
  ["facebook_ads", "📣", "Iklan Facebook", "Copy iklan siap digunakan"],
  ["whatsapp_promo", "💬", "Promosi WhatsApp", "Pesan promosi natural"],
  ["bio", "👤", "Bio Instagram", "Bio singkat dan profesional"],
  ["brand", "✨", "Nama Brand", "Ide nama brand yang kuat"]
];

const photoTools = [
  ["photoshoot", "📸", "AI Photoshoot", "Foto produk profesional", "Popular"],
  ["product-photo", "🛍️", "AI Product Photo", "Buat foto produk premium", "Soon"],
  ["background", "🌄", "AI Background", "Ganti background dengan AI", "Soon"],
  ["remove-bg", "🪄", "Remove Background", "Hapus background otomatis", "Soon"],
  ["image-generator", "🎨", "AI Image Generator", "Buat gambar dari prompt", "Soon"],
  ["portrait", "🧑", "AI Portrait", "Buat portrait kreatif", "Soon"],
  ["upscale", "✨", "AI Upscale", "Tingkatkan kualitas foto", "Soon"],
  ["poster", "🖼️", "AI Poster & Banner", "Buat materi promosi visual", "Soon"]
];

const videoTools = [
  ["image-to-video", "🎞️", "Image to Video", "Ubah gambar menjadi video"],
  ["text-to-video", "🎥", "Text to Video", "Buat video dari ide"],
  ["talking-photo", "🗣️", "Talking Photo", "Foto yang bisa berbicara"],
  ["product-video", "📦", "Product Video", "Video promosi produk"]
];

type HistoryItem = {
  id: number;
  generator: string;
  prompt: string;
  result: string;
  created_at: string;
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoStyle, setPhotoStyle] = useState("Studio Product");
  const [photoBackground, setPhotoBackground] = useState("Luxury Studio");
  const [photoPrompt, setPhotoPrompt] = useState("");
  const [photoResult, setPhotoResult] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);

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

      const [{ data: profile }, { data: historyData }] = await Promise.all([
        supabase.from("profiles").select("credits").eq("id", user.id).single(),
        supabase
          .from("generation_history")
          .select("id,generator,prompt,result,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (profile) setCredits(profile.credits);
      if (historyData) setHistory(historyData);
    }

    loadUser();
  }, []);

  const tool = contentTools[selected];

  const visibleTools = useMemo(() => {
    if (activeCategory === "content") return contentTools;
    if (activeCategory === "photo") return photoTools;
    if (activeCategory === "video") return videoTools;
    return [...contentTools, ...photoTools, ...videoTools];
  }, [activeCategory]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generator: tool[0],
          values: { prompt }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(`❌ ${data.error || "Gagal membuat konten."}`);
        return;
      }

      setResult(data.result || "Tidak ada hasil dari AI.");
      if (typeof data.credits === "number") setCredits(data.credits);

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data: latest } = await supabase
          .from("generation_history")
          .select("id,generator,prompt,result,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (latest) setHistory(latest);
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

  function selectContentTool(id: string) {
    const index = contentTools.findIndex((item) => item[0] === id);
    if (index >= 0) {
      setActiveCategory("content");
      setSelected(index);
      setResult("");
      setTimeout(() => document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  function comingSoon(name: string) {
    alert(`${name} akan kita aktifkan pada tahap berikutnya.`);
  }

  function selectPhotoTool(id: string) {
    if (id !== "photoshoot") {
      comingSoon(toolLabel(id));
      return;
    }
    setActiveCategory("photo");
    setTimeout(() => document.getElementById("photo-studio")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function handlePhotoFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar JPG, PNG, WEBP, atau format gambar lainnya.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran foto maksimal 10 MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoResult("");
  }

  async function generatePhoto() {
    if (!photoFile) {
      alert("Upload foto produk terlebih dahulu.");
      return;
    }

    setPhotoLoading(true);
    setPhotoResult("");

    try {
      const formData = new FormData();
      formData.append("image", photoFile);
      formData.append("style", photoStyle);
      formData.append("background", photoBackground);
      formData.append("prompt", photoPrompt);

      const response = await fetch("/api/image", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Gagal membuat foto AI.");
        return;
      }

      setPhotoResult(data.image || "");
      if (typeof data.credits === "number") setCredits(data.credits);
    } catch (error) {
      console.error(error);
      alert("Tidak dapat terhubung ke AI Image. Silakan coba lagi.");
    } finally {
      setPhotoLoading(false);
    }
  }

  function downloadPhoto() {
    if (!photoResult) return;
    const link = document.createElement("a");
    link.href = photoResult;
    link.download = `gilang-ai-photoshoot-${Date.now()}.png`;
    link.click();
  }

  function toolLabel(id: string) {
    const all = [...contentTools, ...photoTools, ...videoTools];
    return all.find((item) => item[0] === id)?.[2] || id;
  }

  return (
    <main className="dashboard-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark">G</div>
          <div>
            <div className="brand-name">Gilang AI</div>
            <div className="brand-subtitle">AI Creative Studio</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a className="nav-item active" href="#top" onClick={() => setMobileMenu(false)}><span>⌂</span> Dashboard</a>
          <div className="nav-label">AI CONTENT</div>
          <button className="nav-item" onClick={() => { setActiveCategory("content"); setMobileMenu(false); }}><span>✍️</span> AI Content</button>
          <button className="nav-item" onClick={() => { setActiveCategory("photo"); setMobileMenu(false); }}><span>📸</span> AI Photo <em>NEW</em></button>
          <button className="nav-item" onClick={() => { setActiveCategory("video"); setMobileMenu(false); }}><span>🎬</span> AI Video <em>SOON</em></button>
          <div className="nav-label">WORKSPACE</div>
          <a className="nav-item" href="/history"><span>📁</span> My Creations</a>
          <a className="nav-item" href="#templates"><span>🧩</span> Template</a>
          <a className="nav-item" href="/favorites"><span>❤️</span> Favorit</a>
          <a className="nav-item" href="/history"><span>🕘</span> Riwayat</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="lifetime-mini">
            <div className="mini-crown">♛</div>
            <strong>Gilang AI Lifetime</strong>
            <span>Akses semua fitur dalam satu paket.</span>
            <a href="/pricing">Lihat paket →</a>
          </div>
          <button className="account-mini" onClick={logout}>
            <span className="avatar">{userEmail ? userEmail[0].toUpperCase() : "G"}</span>
            <span className="account-copy"><strong>{userEmail || "Akun Gilang"}</strong><small>Logout</small></span>
            <span>⋮</span>
          </button>
        </div>
      </aside>

      {mobileMenu && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setMobileMenu(false)} />}

      <section className="main-area" id="top">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileMenu(true)}>☰</button>
          <div className="search-box"><span>⌕</span><input placeholder="Cari tools, template, atau kreasi..." /></div>
          <div className="top-actions">
            <div className="credit-pill">✦ {credits === null ? "..." : credits} credits</div>
            <a className="icon-button" href="/history" aria-label="Riwayat">🕘</a>
            <a className="icon-button" href="/pricing" aria-label="Pricing">♛</a>
            <div className="top-avatar">{userEmail ? userEmail[0].toUpperCase() : "G"}</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="hero-dashboard">
            <div className="hero-copy">
              <div className="eyebrow">AI CREATIVE STUDIO</div>
              <h1>Bangun konten <span>lebih cepat</span><br />dengan Gilang AI.</h1>
              <p>Satu workspace untuk membuat konten, foto produk, materi promosi, dan video dengan bantuan AI.</p>
              <div className="hero-buttons">
                <button className="primary-btn" onClick={() => { setActiveCategory("content"); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }}>✨ Mulai Membuat</button>
                <a className="secondary-btn" href="/history">Lihat kreasi saya →</a>
              </div>
            </div>
            <div className="hero-orbit" aria-hidden="true">
              <div className="orbit-ring ring-one" />
              <div className="orbit-ring ring-two" />
              <div className="hero-spark">✦</div>
              <div className="float-card card-one">📸<strong>AI Photo</strong><small>Photoshoot</small></div>
              <div className="float-card card-two">✍️<strong>AI Content</strong><small>Caption & Copy</small></div>
              <div className="float-card card-three">🎬<strong>AI Video</strong><small>Coming soon</small></div>
            </div>
          </section>

          <section className="lifetime-banner">
            <div className="banner-icon">♛</div>
            <div className="banner-copy"><strong>Gilang AI Lifetime</strong><span>Satu kali bayar. Akses platform selamanya. Tanpa subscription bulanan.</span></div>
            <a href="/pricing" className="banner-btn">Lihat Lifetime →</a>
          </section>

          <section className="section-block" id="tools">
            <div className="section-heading"><div><span className="section-kicker">WORKSPACE</span><h2>AI Tools</h2><p>Pilih alat yang ingin kamu gunakan.</p></div><div className="category-tabs"><button className={activeCategory === "all" ? "tab active" : "tab"} onClick={() => setActiveCategory("all")}>Semua</button><button className={activeCategory === "content" ? "tab active" : "tab"} onClick={() => setActiveCategory("content")}>Content</button><button className={activeCategory === "photo" ? "tab active" : "tab"} onClick={() => setActiveCategory("photo")}>Photo</button><button className={activeCategory === "video" ? "tab active" : "tab"} onClick={() => setActiveCategory("video")}>Video</button></div></div>

            <div className="tool-grid">
              {visibleTools.map((item: string[]) => {
                const isContent = contentTools.some((toolItem) => toolItem[0] === item[0]);
                const status = item[4];
                return (
                  <button key={item[0]} className={`tool-card ${isContent && item[0] === tool[0] ? "selected" : ""}`} onClick={() => isContent ? selectContentTool(item[0]) : (activeCategory === "photo" ? selectPhotoTool(item[0]) : comingSoon(item[2]))}>
                    <div className="tool-card-top"><span className="tool-icon">{item[1]}</span>{status && <span className={`tool-status ${status === "Popular" ? "popular" : "soon"}`}>{status}</span>}</div>
                    <strong>{item[2]}</strong><span>{item[3]}</span><div className="tool-arrow">→</div>
                  </button>
                );
              })}
            </div>
          </section>

          {activeCategory === "photo" ? (
            <section className="section-block photo-studio-section" id="photo-studio">
              <div className="section-heading compact"><div><span className="section-kicker">AI PHOTO STUDIO</span><h2>📸 AI Photoshoot</h2><p>Ubah foto produk biasa menjadi foto profesional dengan AI.</p></div><span className="active-badge">● Aktif</span></div>
              <div className="photo-workspace">
                <div className="photo-controls">
                  <label className="upload-zone">
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoFile(e.target.files?.[0])} />
                    {photoPreview ? <img src={photoPreview} alt="Preview produk" /> : <><span className="upload-icon">☁️</span><strong>Upload foto produk</strong><small>JPG, PNG, WEBP • Maks. 10 MB</small></>}
                  </label>
                  <div className="photo-field"><label>Style Foto</label><div className="choice-grid">{["Studio Product","Luxury","Minimalist","Outdoor","Food Photography"].map((item) => <button type="button" key={item} className={photoStyle === item ? "choice active" : "choice"} onClick={() => setPhotoStyle(item)}>{item}</button>)}</div></div>
                  <div className="photo-field"><label>Background</label><div className="choice-grid">{["Luxury Studio","White Studio","Marble","Cafe","Nature","Custom"].map((item) => <button type="button" key={item} className={photoBackground === item ? "choice active" : "choice"} onClick={() => setPhotoBackground(item)}>{item}</button>)}</div></div>
                  <div className="photo-field"><label>Instruksi tambahan <span>(opsional)</span></label><textarea className="photo-prompt" value={photoPrompt} onChange={(e) => setPhotoPrompt(e.target.value)} placeholder="Contoh: letakkan produk di atas meja dengan pencahayaan hangat..." rows={3} /></div>
                  <button className="primary-btn photo-generate-btn" onClick={generatePhoto} disabled={photoLoading}>{photoLoading ? "⏳ Sedang membuat foto..." : "✨ Generate AI Photoshoot"}</button>
                  <small className="photo-note">1 generate menggunakan 1 credit pada versi awal.</small>
                </div>
                <div className="photo-result-panel">
                  {photoResult ? <><div className="photo-result-image"><img src={photoResult} alt="Hasil AI Photoshoot" /></div><div className="photo-result-actions"><button className="secondary-btn small" onClick={downloadPhoto}>⬇️ Download</button><a className="text-link" href="/history">📁 Tersimpan di My Creations</a></div></> : <div className="photo-empty"><div>📸</div><strong>Hasil foto akan muncul di sini</strong><span>Upload produk lalu pilih style dan background.</span></div>}
                </div>
              </div>
            </section>
          ) : (
            <>
              <section className="section-block generator-section" id="generator">
                <div className="section-heading compact"><div><span className="section-kicker">AI CONTENT</span><h2>{tool[1]} {tool[2]}</h2><p>Gunakan generator yang sudah aktif dari project Gilang AI kamu.</p></div><span className="active-badge">● Aktif</span></div>
                <div className="generator-card">
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={`Contoh: buat ${String(tool[2]).toLowerCase()} untuk bisnis ayam geprek...`} rows={5} />
                  <div className="generator-footer"><span>💡 Semakin detail brief, semakin spesifik hasilnya.</span><button className="primary-btn" onClick={generate} disabled={loading}>{loading ? "⏳ Membuat..." : "✨ Generate"}</button></div>
                </div>
              </section>
              {result && <section className="result-card"><div className="result-head"><div><span className="section-kicker">HASIL AI</span><h2>Hasil Generate</h2></div><button className="secondary-btn small" onClick={copyResult}>📋 Copy</button></div><div className="result-text">{result}</div></section>}
            </>
          )}

          <section className="section-block" id="recent">
            <div className="section-heading"><div><span className="section-kicker">WORKSPACE</span><h2>Kreasi Terbaru</h2><p>Hasil yang baru saja kamu buat.</p></div><a className="text-link" href="/history">Lihat semua →</a></div>
            <div className="recent-grid">
              {history.length > 0 ? history.map((item) => <a className="recent-card" key={item.id} href="/history"><div className="recent-art"><span>{item.generator === "caption" ? "✍️" : item.generator === "ideas" ? "💡" : item.generator === "hook" ? "🔥" : "✨"}</span></div><div className="recent-meta"><strong>{toolLabel(item.generator)}</strong><span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span></div><p>{item.result.slice(0, 90)}{item.result.length > 90 ? "…" : ""}</p></a>) : <div className="empty-state"><div>✦</div><strong>Belum ada kreasi</strong><span>Mulai membuat konten dan hasilnya akan muncul di sini.</span></div>}
            </div>
          </section>

          <section className="section-block" id="templates">
            <div className="section-heading"><div><span className="section-kicker">COMING NEXT</span><h2>Ekosistem Gilang AI</h2><p>Dashboard ini sudah disiapkan untuk modul berikutnya.</p></div></div>
            <div className="future-grid"><div><span>📸</span><strong>AI Photo Studio</strong><p>Photoshoot, product photo, background, portrait, upscale.</p><b>STEP 2</b></div><div><span>🎬</span><strong>AI Video Studio</strong><p>Image-to-video, talking photo, product video dan lainnya.</p><b>STEP 3</b></div><div><span>🧩</span><strong>Template Library</strong><p>Template siap pakai untuk UMKM, creator, dan marketer.</p><b>STEP 4</b></div></div>
          </section>

          <footer className="dashboard-footer"><strong>Gilang AI</strong><span>AI Creative Studio • 2026</span><span>Konten • Photo • Video</span></footer>
        </div>
      </section>
    </main>
  );
}
