"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { appointmentSchema } from "@/lib/validators/appointment.schema";
import { createAppointment, updateAppointment } from "@/actions/appointments";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { AppointmentWithUser, User } from "@/types";
import type { z } from "zod";

type FormValues = z.input<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointment?: AppointmentWithUser;
  users: User[];
  onSuccess?: () => void;
}

const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "DONE", label: "Realizada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function AppointmentForm({ appointment, users, onSuccess }: AppointmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!appointment;

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

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateAppointment(appointment.id, data)
        : await createAppointment(data);

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
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Empresa"
          placeholder="Nombre de la empresa"
          error={errors.companyName?.message}
          {...register("companyName")}
        />
        <Input
          label="Persona de contacto"
          placeholder="Nombre completo"
          error={errors.contactName?.message}
          {...register("contactName")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="correo@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Teléfono"
          type="tel"
          placeholder="+34 600 000 000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Fecha"
          type="date"
          defaultValue={defaultDate}
          error={errors.date?.message}
          {...register("date")}
        />
        <Input
          label="Hora"
          type="time"
          error={errors.time?.message}
          {...register("time")}
        />
        <Select
          label="Estado"
          options={statusOptions}
          error={errors.status?.message}
          {...register("status")}
        />
        <Select
          label="Responsable"
          options={userOptions}
          error={errors.assignedTo?.message}
          {...register("assignedTo")}
        />
      </div>
      <Textarea
        label="Notas"
        placeholder="Notas adicionales sobre la cita..."
        rows={3}
        error={errors.notes?.message}
        {...register("notes")}
      />
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Guardar cambios" : "Crear cita"}
        </Button>
      </div>
    </form>
  );
}
