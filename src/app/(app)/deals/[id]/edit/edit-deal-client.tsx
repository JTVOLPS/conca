"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DealForm } from "@/components/deals/deal-form";
import { updateDeal } from "@/lib/actions/deals";
import type { DealFormData } from "@/lib/schemas/deal";

interface EditDealClientProps {
  id: string;
  deal: Record<string, unknown>;
  properties: Array<{ id: string; label: string }>;
  contacts: Array<{ id: string; label: string }>;
}

export function EditDealClient({
  id,
  deal,
  properties,
  contacts,
}: EditDealClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: DealFormData) {
    setIsLoading(true);
    try {
      const result = await updateDeal(id, data);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.push(`/deals/${id}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DealForm
      initialData={deal as Partial<DealFormData>}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      properties={properties}
      contacts={contacts}
    />
  );
}
