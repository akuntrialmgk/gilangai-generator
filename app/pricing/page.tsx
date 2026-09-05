"use client";

import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    icon: "🆓",
    credits: 10,
    price: "Gratis",
    description: "Untuk mencoba GilangAI.",
    features: [
      "10 Credits",
      "10 AI Tools",
      "Riwayat Generate",
      "Copy hasil"
    ],
    button: "Paket Saat Ini"
  },
  {
    name: "Pro",
    icon: "⚡",
    credits: 100,
    price: "Rp19.000",
    description: "Untuk UMKM dan kreator aktif.",
    features: [
      "100 Credits",
      "10 AI Tools",
      "Riwayat Generate",
      "Prioritas penggunaan"
    ],
    button: "Upgrade Pro"
  },
  {
    name: "Premium",
    icon: "👑",
    credits: 500,
    price: "Rp49.000",
    description: "Untuk pengguna dengan kebutuhan tinggi.",
    features: [
      "500 Credits",
      "10 AI Tools",
      "Riwayat Generate",
      "Prioritas penggunaan",
      "Nilai credit lebih hemat"
    ],
    button: "Upgrade Premium"
  }
];

export default function PricingPage() {
  const router = useRouter();

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
            textAlign: "center",
            padding: "30px 10px"
          }}
        >
          <h1
            style={{
              fontSize: 36,
              marginBottom: 10
            }}
          >
            🤖 GilangAI
          </h1>

          <h2>Pilih Paket yang Sesuai</h2>

          <p style={{ color: "#64748b" }}>
            Dapatkan lebih banyak credits untuk membuat lebih banyak
            konten dengan AI.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: 18
          }}
        >
          {plans.map((plan) => (
            <section
              key={plan.name}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 24,
                border:
                  plan.name === "Pro"
                    ? "2px solid #6d4aff"
                    : "1px solid #e2e8f0",
                boxShadow:
                  "0 6px 20px rgba(0,0,0,.06)",
                position: "relative"
              }}
            >
              {plan.name === "Pro" && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 18,
                    padding: "5px 10px",
                    borderRadius: 20,
                    background: "#6d4aff",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "bold"
                  }}
                >
                  POPULER
                </div>
              )}

              <div style={{ fontSize: 38 }}>
                {plan.icon}
              </div>

              <h2>{plan.name}</h2>

              <p style={{ color: "#64748b" }}>
                {plan.description}
              </p>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  margin: "18px 0 5px"
                }}
              >
                {plan.price}
              </div>

              <div
                style={{
                  color: "#6d4aff",
                  fontWeight: "bold",
                  marginBottom: 20
                }}
              >
                🪙 {plan.credits} Credits
              </div>

              <div>
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    style={{
                      padding: "8px 0",
                      color: "#475569"
                    }}
                  >
                    ✓ {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (plan.name !== "Free") {
                    alert(
                      "Pembayaran akan segera tersedia."
                    );
                  }
                }}
                disabled={plan.name === "Free"}
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: 13,
                  border: 0,
                  borderRadius: 10,
                  background:
                    plan.name === "Free"
                      ? "#e2e8f0"
                      : "#6d4aff",
                  color:
                    plan.name === "Free"
                      ? "#64748b"
                      : "#fff",
                  fontWeight: "bold"
                }}
              >
                {plan.button}
              </button>
            </section>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 30
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "11px 18px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              fontWeight: "bold"
            }}
          >
            ← Kembali ke Generator
          </button>
        </div>

        <footer
          style={{
            textAlign: "center",
            padding: "30px 0",
            color: "#64748b"
          }}
        >
          © 2026 GilangAI Generator
        </footer>
      </div>
    </main>
  );
}
