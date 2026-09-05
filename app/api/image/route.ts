import OpenAI, { toFile } from "openai";
import { InferenceClient } from "@huggingface/inference";
import { Client as GradioClient, handle_file } from "@gradio/client";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 60;

const HF_SPACE = process.env.HF_SPACE_NAME || "sam9594/qwen-image-edit-rapid-aio-v23";

const BUCKET = "ai-creations";

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

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        }
      }
    }
  );
}

export async function POST(req: Request) {
  let supabase: Awaited<ReturnType<typeof getSupabase>> | null = null;
  let uploadedPath = "";

  try {
    supabase = await getSupabase();

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
    let outputContentType = "image/png";

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
          error: "HF_TOKEN belum diatur di Vercel. Tambahkan token Hugging Face untuk mode gratis."
        }, { status: 500 });
      }

      // Primary free route: Hugging Face Inference Providers.
      // If the small monthly provider credit is exhausted, automatically
      // fall back to the public Qwen ZeroGPU Space for MVP testing.
      try {
        const client = new InferenceClient(process.env.HF_TOKEN);
        const result = await client.imageToImage({
          inputs: new Blob([bytes], { type: image.type }),
          model: process.env.HF_IMAGE_MODEL || "Qwen/Qwen-Image-Edit",
          parameters: {
            prompt,
            target_size: { width: 1024, height: 1024 }
          }
        });

        outputContentType = result.type || "image/png";
        outputBytes = Buffer.from(await result.arrayBuffer());
      } catch (providerError: any) {
        const providerStatus = Number(providerError?.status || providerError?.response?.status || 0);
        const providerMessage = String(providerError?.message || "");
        const quotaError = providerStatus === 402 || providerStatus === 429 || /depleted|credits|prepaid|included usage|purchase/i.test(providerMessage);

        if (!quotaError) throw providerError;

        console.warn("HF Inference Providers quota exhausted; falling back to ZeroGPU Space with low-step mode.");

        const gradio = await GradioClient.connect(HF_SPACE);
        const result = await gradio.predict("/edit_image", [
          handle_file(bytes),
          prompt,
          42,
          true,
          768
        ]);

        const first = (result as any)?.data?.[0];
        const imageUrl = typeof first === "string" ? first : first?.url || first?.path;
        if (!imageUrl) {
          throw new Error("ZeroGPU Space tidak mengembalikan URL gambar.");
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Gagal mengambil hasil gambar dari ZeroGPU Space (${imageResponse.status}).`);
        }

        outputContentType = imageResponse.headers.get("content-type") || "image/png";
        outputBytes = Buffer.from(await imageResponse.arrayBuffer());
      }
    }

    if (!outputBytes.length) {
      return NextResponse.json({ error: "AI menghasilkan file gambar kosong." }, { status: 502 });
    }

    // Simpan hasil ke Supabase Storage pada folder milik user.
    uploadedPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(uploadedPath, outputBytes, {
        contentType: outputContentType,
        cacheControl: "31536000",
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({
        error: `Gambar berhasil dibuat, tetapi gagal disimpan ke Supabase Storage: ${uploadError.message}`
      }, { status: 500 });
    }

    const { data: remainingCredits, error: creditError } = await supabase.rpc("use_credit", { user_id: user.id });
    if (creditError) {
      console.error("Credit error:", creditError);
      await supabase.storage.from(BUCKET).remove([uploadedPath]);
      return NextResponse.json({ error: "Gambar berhasil dibuat, tetapi kredit gagal diproses." }, { status: 500 });
    }

    const newCredits = Number(remainingCredits);
    if (newCredits < 0) {
      await supabase.storage.from(BUCKET).remove([uploadedPath]);
      return NextResponse.json({ error: "Kredit kamu sudah habis. Silakan upgrade untuk mendapatkan kredit tambahan." }, { status: 403 });
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(uploadedPath, 60 * 60 * 24);

    if (signedError || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedError);
      await supabase.storage.from(BUCKET).remove([uploadedPath]);
      return NextResponse.json({ error: "Gambar tersimpan, tetapi URL hasil gagal dibuat." }, { status: 500 });
    }

    return NextResponse.json({
      image: signedData.signedUrl,
      storagePath: uploadedPath,
      credits: newCredits
    });
  } catch (error: any) {
    if (supabase && uploadedPath) {
      try {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      } catch {}
    }

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
