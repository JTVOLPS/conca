import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  status: z
    .enum(["todo", "in_progress", "done", "cancelled"])
    .optional()
    .default("todo"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .default("medium"),
  due_date: z.string().optional().or(z.literal("")),
  entity_type: z
    .enum(["deal", "property", "contact", "company"])
    .nullable()
    .optional(),
  entity_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
});

export type TaskFormData = z.infer<typeof taskSchema>;
