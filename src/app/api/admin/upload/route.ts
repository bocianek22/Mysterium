import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "application/pdf": ".pdf",
};
const ALLOWED_TYPES = Object.keys(ALLOWED);

export async function POST(req: NextRequest) {
  const ctype = req.headers.get("content-type") || "";

  // 1) Bezpośredni upload przeglądarka → Vercel Blob (handshake JSON z @vercel/blob/client).
  //    Omija limit 4.5 MB funkcji Vercela i działa na read-only filesystem.
  if (ctype.includes("application/json")) {
    try {
      const body = (await req.json()) as HandleUploadBody;
      const json = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async () => {
          // Autoryzacja tylko przy generowaniu tokenu (nie przy callbacku zakończenia).
          if (!(await getSession())) throw new Error("Brak autoryzacji");
          return { allowedContentTypes: ALLOWED_TYPES, maximumSizeInBytes: MAX_BYTES, addRandomSuffix: true };
        },
        onUploadCompleted: async () => {
          /* nic — adres pliku odbiera klient */
        },
      });
      return NextResponse.json(json);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Błąd uploadu (Blob)";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  // 2) Fallback multipart (dev / VPS / brak Vercel Blob).
  if (!(await getSession())) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Plik jest za duży (max 50 MB)" }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Niedozwolony typ pliku (JPG, PNG, WEBP, GIF, AVIF, MP4, WEBM, PDF)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;

  // Produkcja z tokenem, mały plik (≤4.5 MB) — zapis przez funkcję do Blob.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${name}`, buffer, { access: "public", contentType: file.type });
      return NextResponse.json({ url: blob.url });
    } catch (e) {
      console.error("[upload] blob error", e);
      return NextResponse.json({ error: "Błąd zapisu pliku (Blob)" }, { status: 500 });
    }
  }

  // Lokalnie / VPS: zapis na dysk. Na Vercel zwróci czytelny błąd zamiast crasha.
  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buffer);
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    console.error("[upload] disk error", e);
    return NextResponse.json(
      { error: "Zapis pliku nieudany. Na Vercel włącz Storage → Blob (ustawi BLOB_READ_WRITE_TOKEN)." },
      { status: 500 }
    );
  }
}
