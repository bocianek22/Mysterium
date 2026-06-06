import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
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
    return NextResponse.json(
      { error: "Niedozwolony typ pliku (dozwolone: JPG, PNG, WEBP, GIF, MP4, WEBM)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;

  // Produkcja (Vercel): zapis do Vercel Blob, jeśli skonfigurowany token.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${name}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    } catch (e) {
      console.error("[upload] blob error", e);
      return NextResponse.json({ error: "Błąd zapisu pliku (Blob)" }, { status: 500 });
    }
  }

  // Lokalnie / VPS: zapis na dysk
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return NextResponse.json({ url: `/uploads/${name}` });
}
