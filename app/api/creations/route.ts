import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BUCKET = "ai-creations";
const SIGNED_URL_SECONDS = 60 * 60 * 24;

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

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list(user.id, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" }
      });

    if (error) {
      return NextResponse.json({ error: `Gagal memuat kreasi: ${error.message}` }, { status: 500 });
    }

    const creations = await Promise.all(
      (files || [])
        .filter((file) => Boolean(file.name))
        .map(async (file) => {
          const path = `${user.id}/${file.name}`;
          const { data: signed } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(path, SIGNED_URL_SECONDS);

          return {
            name: file.name,
            path,
            url: signed?.signedUrl || "",
            created_at: file.created_at || file.updated_at || new Date().toISOString(),
            size: file.metadata?.size || null
          };
        })
    );

    return NextResponse.json({ creations: creations.filter((item) => item.url) });
  } catch (error: any) {
    console.error("GilangAI Creations GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat My Creations." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const path = String(body?.path || "");
    const prefix = `${user.id}/`;

    // Jangan izinkan user menghapus file di folder user lain.
    if (!path.startsWith(prefix) || path.includes("..")) {
      return NextResponse.json({ error: "Path file tidak valid." }, { status: 400 });
    }

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      return NextResponse.json({ error: `Gagal menghapus gambar: ${error.message}` }, { status: 500 });
    }

    // Hapus juga status favorit jika gambar tersebut pernah difavoritkan.
    await supabase
      .from("favorite_creations")
      .delete()
      .eq("user_id", user.id)
      .eq("storage_path", path);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("GilangAI Creations DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus gambar." }, { status: 500 });
  }
}
