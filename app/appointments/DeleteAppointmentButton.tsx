"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface DeleteAppointmentButtonProps {
  id: string;
}

export function DeleteAppointmentButton({ id }: DeleteAppointmentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta cita?")) return;
    startTransition(async () => {
      await deleteAppointment(id);
      router.refresh();
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      loading={isPending}
      onClick={handleDelete}
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
