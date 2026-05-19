"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { appointmentSchema } from "@/lib/validators/appointment.schema";
import { createAppointment, updateAppointment } from "@/actions/appointments";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUploadZone, type PendingFile, type ExistingFile } from "@/components/ui/FileUploadZone";
import type { AppointmentWithUser, User } from "@/types";
import type { z } from "zod";

type FormValues = z.input<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointment?: AppointmentWithUser & { files?: ExistingFile[] };
  users: User[];
  onSuccess?: () => void;
}

const statusOptions = [
  { value: "PENDING",   label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "DONE",      label: "Realizada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function AppointmentForm({ appointment, users, onSuccess }: AppointmentFormProps) {
  const router = useRouter();
  const isEditing = !!appointment;

  const [isPending, setIsPending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);

  const userOptions = [
    { value: "", label: "Sin asignar" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const defaultDate = appointment?.date
    ? new Date(appointment.date).toISOString().split("T")[0]
    : "";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      companyName: appointment?.companyName ?? "",
      contactName: appointment?.contactName ?? "",
      email: appointment?.email ?? "",
      phone: appointment?.phone ?? "",
      date: appointment?.date ? new Date(appointment.date) : undefined,
      time: appointment?.time ?? "",
      status: appointment?.status ?? "PENDING",
      assignedTo: appointment?.assignedTo ?? "",
      notes: appointment?.notes ?? "",
    },
  });

  const existingFiles = (appointment?.files ?? []).filter((f) => !removedFileIds.includes(f.id));

  const onSubmit = handleSubmit(async (data) => {
    setIsPending(true);
    try {
      const result = isEditing
        ? await updateAppointment(appointment.id, data, pendingFiles, removedFileIds)
        : await createAppointment(data, pendingFiles);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof FormValues, { message: messages[0] });
          });
        }
        return;
      }

      onSuccess?.();
      router.push("/appointments");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Empresa" placeholder="Nombre de la empresa" error={errors.companyName?.message} {...register("companyName")} />
        <Input label="Persona de contacto" placeholder="Nombre completo" error={errors.contactName?.message} {...register("contactName")} />
        <Input label="Email" type="email" placeholder="correo@empresa.com" error={errors.email?.message} {...register("email")} />
        <Input label="Teléfono" type="tel" placeholder="+34 600 000 000" error={errors.phone?.message} {...register("phone")} />
        <Input label="Fecha" type="date" defaultValue={defaultDate} error={errors.date?.message} {...register("date")} />
        <Input label="Hora" type="time" error={errors.time?.message} {...register("time")} />
        <Select label="Estado" options={statusOptions} error={errors.status?.message} {...register("status")} />
        <Select label="Responsable" options={userOptions} error={errors.assignedTo?.message} {...register("assignedTo")} />
      </div>

      <Textarea label="Notas" placeholder="Notas adicionales sobre la cita..." rows={3} error={errors.notes?.message} {...register("notes")} />

      {/* Archivos */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-3)" }}>
          Archivos adjuntos
        </p>
        <FileUploadZone
          existingFiles={existingFiles}
          pendingFiles={pendingFiles}
          onPendingAdd={(files) => setPendingFiles((prev) => [...prev, ...files])}
          onPendingRemove={(filename) => setPendingFiles((prev) => prev.filter((f) => f.filename !== filename))}
          onExistingRemove={(id) => setRemovedFileIds((prev) => [...prev, id])}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Guardar cambios" : "Crear cita"}
        </Button>
      </div>
    </form>
  );
}
