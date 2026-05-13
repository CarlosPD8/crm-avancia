"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProposal } from "@/actions/proposals";
import { Button } from "@/components/ui/Button";

export function DeleteProposalButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("¿Eliminar esta propuesta? También se borrará el PDF adjunto.")) return;
    startTransition(async () => {
      await deleteProposal(id);
      router.refresh();
    });
  };

  return (
    <Button size="sm" variant="danger" loading={isPending} onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
