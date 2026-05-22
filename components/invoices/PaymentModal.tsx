"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentSchema } from "@/lib/validators/invoice.schema";
import { registerPayment } from "@/actions/invoices";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const methodOptions = [
  { value: "TRANSFER", label: "Transferencia bancaria" },
  { value: "CARD",     label: "Tarjeta" },
  { value: "CASH",     label: "Efectivo" },
  { value: "CHEQUE",   label: "Cheque" },
  { value: "OTHER",    label: "Otro" },
];

interface PaymentModalProps {
  invoiceId: string;
  pendingAmount: number;
  open: boolean;
  onClose: () => void;
}

export function PaymentModal({ invoiceId, pendingAmount, open, onClose }: PaymentModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: pendingAmount,
      method: "TRANSFER",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: PaymentSchema) => {
    setServerError(null);
    const result = await registerPayment(invoiceId, data);
    if (!result.success) { setServerError(result.error); return; }
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar pago">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>
              Importe (€)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              {...register("amount")}
              error={errors.amount?.message}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>
              Fecha
            </label>
            <Input type="date" {...register("date")} error={errors.date?.message} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>
            Método de pago
          </label>
          <Select
            options={methodOptions}
            {...register("method")}
            error={errors.method?.message}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>
            Notas (opcional)
          </label>
          <Textarea rows={2} {...register("notes")} placeholder="Referencia, comentario..." />
        </div>

        {serverError && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>{serverError}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting}>Registrar pago</Button>
        </div>
      </form>
    </Modal>
  );
}
