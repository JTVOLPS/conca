"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/property-form";
import { createProperty } from "@/lib/actions/properties";
import type { PropertyFormData } from "@/lib/schemas/property";

export function NewPropertyClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: PropertyFormData) {
    setIsLoading(true);
    try {
      const result = await createProperty(data);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.data) {
        router.push(`/properties/${result.data.id}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return <PropertyForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
