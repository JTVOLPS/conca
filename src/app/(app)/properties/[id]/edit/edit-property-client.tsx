"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/property-form";
import { updateProperty } from "@/lib/actions/properties";
import type { PropertyFormData } from "@/lib/schemas/property";

interface EditPropertyClientProps {
  id: string;
  property: Record<string, unknown>;
}

export function EditPropertyClient({ id, property }: EditPropertyClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: PropertyFormData) {
    setIsLoading(true);
    try {
      const result = await updateProperty(id, data);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.push(`/properties/${id}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PropertyForm
      initialData={property as Partial<PropertyFormData>}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
