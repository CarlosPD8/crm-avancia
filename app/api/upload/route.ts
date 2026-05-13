import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No se ha enviado ningún archivo" }, { status: 400 });
    }

    // Accept by MIME type OR extension — some browsers send application/octet-stream
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 20 MB" }, { status: 400 });
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
    // Return the real error so it's visible in the UI during debugging
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
