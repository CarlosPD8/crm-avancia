import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se ha enviado ningún archivo" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 20 MB" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${Date.now()}-${safeName}`;
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(UPLOAD_DIR, uniqueName), Buffer.from(bytes));

    return NextResponse.json({ filename: uniqueName, originalName: file.name, size: file.size });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
