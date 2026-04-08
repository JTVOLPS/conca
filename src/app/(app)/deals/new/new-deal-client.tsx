"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DealForm } from "@/components/deals/deal-form";
import { createDeal } from "@/lib/actions/deals";
import type { DealFormData } from "@/lib/schemas/deal";

interface NewDealClientProps {
  properties: Array<{ id: string; label: string }>;
  contacts: Array<{ id: string; label: string }>;
}

export function NewDealClient({ properties, contacts }: NewDealClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: DealFormData) {
    setIsLoading(true);
    try {
      const result = await createDeal(data);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.data) {
        router.push(`/deals/${result.data.id}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DealForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      properties={properties}
      contacts={contacts}
    />
  );
}
