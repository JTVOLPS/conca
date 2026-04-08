"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { createInteraction } from "@/lib/actions/interactions";
import { INTERACTION_TYPES } from "@/lib/constants/contact-types";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  Plus,
  Phone,
  Mail,
  Users,
  StickyNote,
  MapPin,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";

const INTERACTION_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: StickyNote,
  site_visit: MapPin,
  other: MoreHorizontal,
};

interface DealActivityPanelProps {
  dealId: string;
  interactions: Array<{
    id: string;
    type: string;
    subject: string | null;
    body: string | null;
    occurred_at: string;
    logged_by: string;
  }>;
}

export function DealActivityPanel({
  dealId,
  interactions,
}: DealActivityPanelProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formType, setFormType] = useState("note");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createInteraction({
        deal_id: dealId,
        type: formType as "call" | "email" | "meeting" | "note" | "site_visit" | "other",
        subject: subject || undefined,
        body: body || undefined,
        occurred_at: occurredAt || undefined,
      });
      if (result.error) {
        alert(result.error);
        return;
      }
      setShowForm(false);
      setSubject("");
      setBody("");
      setFormType("note");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Activity Log</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Log Interaction
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Interaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date/Time</Label>
                  <Input
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Details</Label>
                <Textarea
                  placeholder="What happened?"
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {interactions.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-5 w-5" />}
          title="No activity yet"
          description="Log calls, emails, meetings, and notes for this deal."
        />
      ) : (
        <div className="space-y-3">
          {interactions.map((interaction) => {
            const IconComponent = INTERACTION_ICONS[interaction.type] ?? MoreHorizontal;
            const typeLabel =
              INTERACTION_TYPES.find((t) => t.value === interaction.type)?.label ??
              interaction.type;

            return (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {typeLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(interaction.occurred_at)}
                        </span>
                      </div>
                      {interaction.subject && (
                        <p className="text-sm font-medium mt-1">
                          {interaction.subject}
                        </p>
                      )}
                      {interaction.body && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {interaction.body}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
