"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  interactionSchema,
  type InteractionFormData,
} from "@/lib/schemas/interaction";
import { INTERACTION_TYPES } from "@/lib/constants/contact-types";
import { createInteraction } from "@/lib/actions/interactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface InteractionFormProps {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  onSuccess?: () => void;
}

export function InteractionForm({
  contactId,
  companyId,
  dealId,
  onSuccess,
}: InteractionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      contact_id: contactId ?? null,
      company_id: companyId ?? null,
      deal_id: dealId ?? null,
      type: "note",
      subject: "",
      body: "",
    },
  });

  async function handleSubmit(data: InteractionFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createInteraction(data);
      if (result.error) {
        setError(result.error);
      } else {
        form.reset({
          contact_id: contactId ?? null,
          company_id: companyId ?? null,
          deal_id: dealId ?? null,
          type: "note",
          subject: "",
          body: "",
        });
        onSuccess?.();
      }
    } catch {
      setError("Failed to log interaction");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Brief subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What happened?"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log Interaction
        </Button>
      </form>
    </Form>
  );
}
