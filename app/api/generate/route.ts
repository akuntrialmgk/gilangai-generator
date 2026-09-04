import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt wajib diisi." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result: `Berikut hasil untuk: ${prompt}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
