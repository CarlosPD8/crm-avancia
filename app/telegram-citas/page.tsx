export const dynamic = "force-dynamic";

import { Bot } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TelegramCitasTable, type TelegramCita } from "@/components/telegram-citas/TelegramCitasTable";
import { TelegramCitasFilters } from "@/components/telegram-citas/TelegramCitasFilters";

async function getTelegramCitas(q?: string, estado?: string, fecha?: string): Promise<TelegramCita[]> {
  if (!process.env.DATABASE_TELEGRAM_URL) return [];

  const { prismaT } = await import("@/lib/prisma-telegram");

  try {
    const rows = await prismaT.$queryRawUnsafe<TelegramCita[]>(`
      SELECT
        id::text,
        nombre_cliente,
        telefono,
        fecha::text,
        hora_inicio::text,
        hora_fin::text,
        estado,
        chat_id_telegram
      FROM citas
      WHERE 1=1
        ${q ? `AND (nombre_cliente ILIKE '%${q.replace(/'/g, "''")}%' OR telefono ILIKE '%${q.replace(/'/g, "''")}%')` : ""}
        ${estado ? `AND estado = '${estado.replace(/'/g, "''")}'` : ""}
        ${fecha ? `AND fecha = '${fecha.replace(/'/g, "''")}'` : ""}
      ORDER BY fecha DESC, hora_inicio DESC
    `);
    return rows;
  } catch {
    return [];
  }
}

interface Props {
  searchParams: Promise<{ q?: string; estado?: string; fecha?: string }>;
}

export default async function TelegramCitasPage({ searchParams }: Props) {
  const { q, estado, fecha } = await searchParams;
  const citas = await getTelegramCitas(q, estado, fecha);

  const noConfig = !process.env.DATABASE_TELEGRAM_URL;

  return (
    <PageContainer>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--accent)" }}
          >
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>Citas Telegram</h2>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              {citas.length} cita{citas.length !== 1 ? "s" : ""} registrada{citas.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {noConfig ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <Bot className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--text-3)" }} />
          <p className="font-medium mb-1" style={{ color: "var(--text-1)" }}>Base de datos no configurada</p>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Añade la variable <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-elevated)" }}>DATABASE_TELEGRAM_URL</code> al entorno con la conexión a la base de datos de Telegram.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <TelegramCitasFilters />
          </div>
          <TelegramCitasTable citas={citas} />
        </>
      )}
    </PageContainer>
  );
}
