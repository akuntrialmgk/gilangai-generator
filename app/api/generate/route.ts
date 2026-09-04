import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const prompts: Record<string, string> = {
  caption:
    "Buat caption Instagram berbahasa Indonesia yang menarik, natural, persuasif, dan tidak terasa seperti spam. Sertakan hook, isi caption, CTA, dan hashtag yang relevan.",

  ideas:
    "Buat 10 ide konten yang kreatif dan praktis. Untuk setiap ide berikan judul, hook, konsep, format konten, dan CTA.",

  hook:
    "Buat 15 hook viral dalam Bahasa Indonesia yang kuat, membuat orang berhenti scrolling, dan cocok untuk konten media sosial.",

  product_title:
    "Buat 15 judul produk yang menarik, jelas, mudah dicari, dan cocok untuk marketplace. Berikan beberapa gaya judul.",

  product_description:
    "Buat deskripsi produk marketplace yang menarik dan SEO-friendly. Sertakan headline, manfaat, fitur, keunggulan, dan CTA.",

  tiktok_script:
    "Buat script TikTok lengkap 30-60 detik. Sertakan hook 3 detik pertama, isi, alur visual, dialog/narasi, CTA, dan ide shot.",

  facebook_ads:
    "Buat 3 variasi iklan Facebook: soft selling, direct selling, dan storytelling. Sertakan headline, primary text, dan CTA.",

  whatsapp_promo:
    "Buat 5 teks promosi WhatsApp yang natural dan persuasif. Hindari spam. Sertakan pembuka, penawaran, manfaat, dan CTA.",

  bio:
    "Buat 10 pilihan Bio Instagram yang singkat, profesional, menarik, dan sesuai dengan bisnis atau personal brand pengguna.",

  brand:
    "Buat 15 ide nama brand yang unik, mudah diingat, mudah diucapkan, dan relevan dengan bisnis pengguna. Sertakan arti dan konsep setiap nama."
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          }
        }
      }
    );

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const generator = String(body.generator || "");
    const values = body.values || {};

    if (!prompts[generator]) {
      return NextResponse.json(
        { error: "Generator tidak dikenal." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY belum diatur di Vercel." },
        { status: 500 }
      );
    }

const { data: remainingCredits, error: creditError } =
  await supabase.rpc("use_credit", {
    user_id: user.id
  });

if (creditError) {
  console.error("Credit error:", creditError);

  return NextResponse.json(
    { error: "Gagal memproses kredit." },
    { status: 500 }
  );
}

if (remainingCredits === -1) {
  return NextResponse.json(
    {
      error:
        "Kredit kamu sudah habis. Silakan upgrade untuk mendapatkan kredit tambahan."
    },
    { status: 403 }
  );
}

const newCredits = remainingCredits;

    if (updateError) {
      console.error("Credit update error:", updateError);

      return NextResponse.json(
        { error: "Hasil berhasil dibuat tetapi kredit gagal diperbarui." },
        { status: 500 }
      );
    }

    await supabase.from("generation_history").insert({
  user_id: user.id,
  generator: generator,
  prompt: String(values.prompt || ""),
  result: response.output_text
});
    
    return NextResponse.json({
      result: response.output_text,
      credits: newCredits
    });
  } catch (error) {
    console.error("GilangAI API Error:", error);

    return NextResponse.json(
      {
        error:
          "Gagal menghubungi AI. Periksa API Key, model, atau koneksi."
      },
      { status: 500 }
    );
  }
}
