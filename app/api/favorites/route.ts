import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

function validPath(path: string, userId: string) {
  return path.startsWith(`${userId}/`) && !path.includes("..") && path.length > userId.length + 1;
}

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });

    const { data, error } = await supabase
      .from("favorite_creations")
      .select("storage_path")
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: `Gagal memuat favorit: ${error.message}` }, { status: 500 });
    return NextResponse.json({ favorites: (data || []).map((item) => item.storage_path) });
  } catch (error: any) {
    console.error("GilangAI Favorites GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat favorit." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });

    const body = await req.json();
    const path = String(body?.path || "");
    if (!validPath(path, user.id)) return NextResponse.json({ error: "Path file tidak valid." }, { status: 400 });

    const { error } = await supabase
      .from("favorite_creations")
      .upsert({ user_id: user.id, storage_path: path }, { onConflict: "user_id,storage_path" });

    if (error) return NextResponse.json({ error: `Gagal menyimpan favorit: ${error.message}` }, { status: 500 });
    return NextResponse.json({ success: true, favorite: true });
  } catch (error: any) {
    console.error("GilangAI Favorites POST Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan favorit." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });

    const body = await req.json();
    const path = String(body?.path || "");
    if (!validPath(path, user.id)) return NextResponse.json({ error: "Path file tidak valid." }, { status: 400 });

    const { error } = await supabase
      .from("favorite_creations")
      .delete()
      .eq("user_id", user.id)
      .eq("storage_path", path);

    if (error) return NextResponse.json({ error: `Gagal menghapus favorit: ${error.message}` }, { status: 500 });
    return NextResponse.json({ success: true, favorite: false });
  } catch (error: any) {
    console.error("GilangAI Favorites DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus favorit." }, { status: 500 });
  }
}
