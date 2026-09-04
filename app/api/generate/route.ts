import OpenAI from "openai";
import { NextResponse } from "next/server";

const prompts: Record<string, string> = {
  caption:
    "Buat caption Instagram berbahasa Indonesia yang menarik, natural, persuasif, dan tidak terasa seperti spam. Sertakan hook, isi singkat, CTA, dan 5 hashtag relevan.",

  ideas:
    "Buat daftar ide konten praktis dan kreatif. Untuk setiap ide berikan judul/hook, format, konsep singkat, dan CTA.",

  ads:
    "Buat copywriting iklan yang kuat tetapi tidak berlebihan. Berikan 3 variasi: soft selling, direct selling, dan storytelling. Sertakan headline dan CTA.",

  description:
    "Buat deskripsi produk marketplace yang SEO-friendly, jelas, meyakinkan, dan mudah dipindai. Sertakan headline, manfaat, fitur, cara pakai bila relevan, dan CTA.",

  brand:
    "Buat 15 ide nama brand. Untuk tiap nama berikan arti/konsep, alasan cocok, dan kesan brand. Prioritaskan nama yang mudah diucapkan dan diingat.",

  slogan:
    "Buat 15 slogan pendek, memorable, dan relevan dengan positioning. Kelompokkan berdasarkan gaya.",

  image:
    "Buat prompt gambar AI profesional. Berikan versi Bahasa Indonesia dan versi English. Sertakan subject, composition, lighting, camera, environment, style, detail, negative prompt, dan rasio.",

  video:
    "Buat prompt video AI terstruktur per scene. Sertakan durasi, aksi, camera movement, lighting, environment, transition, audio/mood, dan negative prompt.",

  ebook:
    "Buat outline ebook lengkap. Sertakan judul, subtitle, target pembaca, promise, daftar isi, rincian setiap bab, latihan/action steps, dan bonus.",

  calendar:
    "Buat content calendar sesuai jumlah hari. Setiap hari berikan pilar konten, ide, hook, format, CTA, dan tujuan. Variasikan edukasi, engagement, storytelling, dan selling."
};

export async function POST(req: Request) {
  try {
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

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const input = Object.entries(values)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      instructions:
        "Kamu adalah asisten AI profesional untuk bisnis, UMKM, marketer, dan kreator Indonesia. Jawab dalam Bahasa Indonesia yang natural, praktis, rapi, dan siap digunakan. Jangan menjelaskan proses berpikirmu.",

      input: `${prompts[generator]}

DATA PENGGUNA:
${input}

Berikan hasil final yang rapi dan langsung bisa digunakan.`
    });

    return NextResponse.json({
      result: response.output_text
    });
  } catch (error) {
    console.error("GilangAI API Error:", error);

    return NextResponse.json(
      {
        error:
          "Gagal menghubungi AI. Periksa OPENAI_API_KEY, nama model, dan koneksi."
      },
      { status: 500 }
    );
  }
}
