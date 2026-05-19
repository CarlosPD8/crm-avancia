"use client";

import { useRef, useState } from "react";
import { Upload, FileText, FileSpreadsheet, FileImage, File, X, ExternalLink, Loader2 } from "lucide-react";

export interface PendingFile {
  filename: string;
  originalName: string;
  size: number;
}

export interface ExistingFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
}

interface FileUploadZoneProps {
  existingFiles: ExistingFile[];
  pendingFiles: PendingFile[];
  onPendingAdd: (files: PendingFile[]) => void;
  onPendingRemove: (filename: string) => void;
  onExistingRemove: (id: string) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["xls", "xlsx"].includes(ext)) return FileSpreadsheet;
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return FileImage;
  if (ext === "pdf") return FileText;
  return File;
}

const ACCEPTED = [
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
].join(",");

export function FileUploadZone({
  existingFiles,
  pendingFiles,
  onPendingAdd,
  onPendingRemove,
  onExistingRemove,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);

    const uploaded: PendingFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > 100 * 1024 * 1024) {
        setError(`"${file.name}" supera el límite de 100 MB`);
        continue;
      }
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "Error al subir archivo"); continue; }
        uploaded.push({ filename: json.filename, originalName: json.originalName, size: json.size });
      } catch {
        setError("Error de conexión al subir archivo");
      }
    }

    if (uploaded.length > 0) onPendingAdd(uploaded);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasFiles = existingFiles.length > 0 || pendingFiles.length > 0;

  return (
    <div className="space-y-2">
      {hasFiles && (
        <div className="space-y-1.5">
          {existingFiles.map((f) => (
            <FileRow
              key={f.id}
              name={f.originalName}
              size={f.size}
              href={`/api/files/${f.filename}`}
              onRemove={() => onExistingRemove(f.id)}
            />
          ))}
          {pendingFiles.map((f) => (
            <FileRow
              key={f.filename}
              name={f.originalName}
              size={f.size}
              href={`/api/files/${f.filename}`}
              onRemove={() => onPendingRemove(f.filename)}
              isPending
            />
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-4 transition-all"
        style={{
          border: `1.5px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
          background: dragging ? "var(--accent-light)" : "var(--bg-input)",
          color: dragging ? "var(--accent)" : "var(--text-3)",
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading
          ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm font-medium">Subiendo...</span></>
          : <><Upload className="h-4 w-4" /><span className="text-sm font-medium">{hasFiles ? "Añadir más archivos" : "Adjuntar archivos"}</span><span className="text-xs opacity-70">PDF, Word, Excel, imágenes — máx. 100 MB</span></>
        }
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />

      {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}

function FileRow({
  name, size, href, onRemove, isPending,
}: {
  name: string; size: number; href: string; onRemove: () => void; isPending?: boolean;
}) {
  const Icon = fileIcon(name);
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: isPending ? "var(--success-muted)" : "var(--accent-light)" }}
        >
          <Icon className="h-4 w-4" style={{ color: isPending ? "var(--success)" : "var(--accent)" }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: "var(--text-1)" }}>{name}</p>
          <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{formatBytes(size)}{isPending && " · pendiente de guardar"}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg transition-opacity hover:opacity-60"
          style={{ color: "var(--text-3)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg transition-opacity hover:opacity-60"
          style={{ color: "var(--text-3)" }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
