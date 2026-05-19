import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/octet-stream",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".jpg", ".jpeg", ".png", ".webp",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No se ha enviado ningún archivo" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const isAllowed = ALLOWED_MIMES.has(file.type) || ALLOWED_EXTENSIONS.has(ext);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Se aceptan PDF, Word, Excel, PowerPoint e imágenes." },
        { status: 400 },
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 100 MB" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${Date.now()}-${safeName}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(arrayBuffer));

    return NextResponse.json({ filename: uniqueName, originalName: file.name, size: file.size });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Upload] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
