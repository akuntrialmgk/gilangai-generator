import OpenAI, { toFile } from "openai";
import { InferenceClient } from "@huggingface/inference";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 60;

const styles: Record<string, string> = {
  "Studio Product": "professional commercial product photography, clean studio lighting, realistic premium ecommerce photography",
  Luxury: "luxury advertising photography, elegant premium styling, cinematic studio lighting, high-end commercial campaign",
  Minimalist: "minimalist product photography, clean composition, soft natural light, modern premium aesthetic",
  Outdoor: "professional outdoor lifestyle product photography, natural light, realistic environment, commercial campaign",
  "Food Photography": "appetizing professional food photography, realistic texture, premium restaurant advertising style"
};

const backgrounds: Record<string, string> = {
  "Luxury Studio": "an elegant luxury studio background",
  "White Studio": "a clean seamless white studio background",
  Marble: "a premium marble surface in a refined studio setting",
  Cafe: "a tasteful modern cafe environment",
  Nature: "a natural outdoor environment with soft beautiful light",
  Custom: "a visually appropriate premium commercial background"
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });

    const form = await req.formData();
    const image = form.get("image");
    const style = String(form.get("style") || "Studio Product");
    const background = String(form.get("background") || "Luxury Studio");
    const extra = String(form.get("prompt") || "");

    if (!(image instanceof File)) return NextResponse.json({ error: "Foto produk wajib diupload." }, { status: 400 });
    if (!image.type.startsWith("image/")) return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
    if (image.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Ukuran foto maksimal 10 MB." }, { status: 400 });

    const bytes = Buffer.from(await image.arrayBuffer());

    const prompt = `Create a polished commercial product photoshoot from the uploaded reference image. Preserve the exact identity, shape, packaging, logo placement, colors, proportions, and important details of the product. Do not invent a different product. ${styles[style] || styles["Studio Product"]}. Place the product in ${backgrounds[background] || backgrounds["Luxury Studio"]}. Make the final image photorealistic, sharp, premium, naturally lit, and suitable for Indonesian ecommerce/social media marketing. ${extra ? `Additional direction: ${extra}` : ""}`;

    const provider = (process.env.IMAGE_PROVIDER || "huggingface").toLowerCase();
    let outputBytes: Buffer;

    if (provider === "openai") {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "OPENAI_API_KEY belum diatur di Vercel." }, { status: 500 });
      }

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const inputImage = await toFile(bytes, image.name || "product.png", { type: image.type });
      const response = await client.images.edit({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
        image: inputImage,
        prompt,
        size: "1024x1024"
      });

      const imageBase64 = response.data?.[0]?.b64_json;
      if (!imageBase64) return NextResponse.json({ error: "AI tidak mengembalikan gambar." }, { status: 502 });
      outputBytes = Buffer.from(imageBase64, "base64");
    } else {
      if (!process.env.HF_TOKEN) {
        return NextResponse.json({
          error: "Mode gratis belum dikonfigurasi. Tambahkan HF_TOKEN di Vercel. Tidak perlu menambahkan saldo OpenAI untuk mode gratis."
        }, { status: 500 });
      }

      const client = new InferenceClient(process.env.HF_TOKEN);
      const result = await client.imageToImage({
        data: new Blob([bytes], { type: image.type }),
        model: process.env.HF_IMAGE_MODEL || "Qwen/Qwen-Image-Edit",
        parameters: {
          prompt,
          target_size: { width: 1024, height: 1024 }
        }
      });

      outputBytes = Buffer.from(await result.arrayBuffer());
    }

    const imageBase64 = outputBytes.toString("base64");

    const { data: remainingCredits, error: creditError } = await supabase.rpc("use_credit", { user_id: user.id });
    if (creditError) {
      console.error("Credit error:", creditError);
      return NextResponse.json({ error: "Gambar berhasil dibuat, tetapi kredit gagal diproses." }, { status: 500 });
    }

    const newCredits = Number(remainingCredits);
    if (newCredits < 0) return NextResponse.json({ error: "Kredit kamu sudah habis. Silakan upgrade untuk mendapatkan kredit tambahan." }, { status: 403 });

    return NextResponse.json({ image: `data:image/png;base64,${imageBase64}`, credits: newCredits });
  } catch (error: any) {
    console.error("GilangAI Image API Error:", error);
    const status = Number(error?.status || error?.response?.status || 500);
    const message = String(error?.message || "Gagal membuat gambar AI.");
    return NextResponse.json({
      error: status === 402 || status === 429
        ? "Kuota provider gambar gratis sedang habis atau provider meminta pembayaran. Coba lagi nanti atau gunakan provider lain."
        : `Gagal membuat gambar AI: ${message.slice(0, 300)}`
    }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
