"use client";

import { useState } from "react";
import { createClient } from "../../utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/`
  }
});
        

        if (error) {
          setMessage(`❌ ${error.message}`);
        } else {
          setMessage(
            "✅ Registrasi berhasil. Cek email kamu untuk konfirmasi akun."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setMessage(`❌ ${error.message}`);
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7fb",
        padding: 20
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 8px 30px rgba(0,0,0,.08)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 25 }}>
          <div style={{ fontSize: 48 }}>🤖</div>

          <h1 style={{ margin: "8px 0" }}>
            GilangAI
          </h1>

          <p style={{ color: "#64748b" }}>
            {isRegister
              ? "Buat akun GilangAI"
              : "Masuk ke akun GilangAI"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 13,
              marginTop: 7,
              marginBottom: 16,
              borderRadius: 10,
              border: "1px solid #cbd5e1"
            }}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 13,
              marginTop: 7,
              marginBottom: 16,
              borderRadius: 10,
              border: "1px solid #cbd5e1"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              border: 0,
              borderRadius: 10,
              background: loading ? "#94a3b8" : "#6d4aff",
              color: "#fff",
              fontWeight: "bold"
            }}
          >
            {loading
              ? "⏳ Memproses..."
              : isRegister
                ? "🚀 Daftar"
                : "🔐 Masuk"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: 18,
              padding: 12,
              borderRadius: 10,
              background: "#f1f5f9",
              color: "#334155",
              fontSize: 14
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: 22
          }}
        >
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
            style={{
              border: 0,
              background: "transparent",
              color: "#6d4aff",
              fontWeight: "bold"
            }}
          >
            {isRegister
              ? "Sudah punya akun? Masuk"
              : "Belum punya akun? Daftar"}
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 18
          }}
        >
          <a
            href="/"
            style={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: 14
            }}
          >
            ← Kembali ke GilangAI
          </a>
        </div>
      </div>
    </main>
  );
}
