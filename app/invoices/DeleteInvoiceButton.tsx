"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteInvoice } from "@/actions/invoices";

export function DeleteInvoiceButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    await deleteInvoice(id);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg transition-opacity hover:opacity-60 disabled:opacity-30"
      style={{ color: "var(--danger)" }}
      title="Eliminar factura"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
