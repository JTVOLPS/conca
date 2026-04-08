"use client";

import { useState } from "react";
import { MessageSquare, Phone, Mail, Calendar, MapPin, FileText } from "lucide-react";
import { createInteraction } from "@/lib/actions/interactions";
import { INTERACTION_TYPES } from "@/lib/constants/contact-types";
import { formatDate } from "@/lib/utils";

const INTERACTION_ICONS: Record<string, typeof MessageSquare> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
  site_visit: MapPin,
  other: FileText,
};

interface DealActivityTabProps {
  dealId: string;
  interactions: Record<string, unknown>[];
}

export function DealActivityTab({
  dealId,
  interactions,
}: DealActivityTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<string>("note");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    await createInteraction({
      deal_id: dealId,
      type: type as "call" | "email" | "meeting" | "note" | "site_visit" | "other",
      subject: subject || undefined,
      body: body || undefined,
    });
    setSubject("");
    setBody("");
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Activity ({interactions.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 rounded-md text-sm font-medium h-8 px-3 border border-input bg-background hover:bg-accent"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Log Activity
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {INTERACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <textarea
            placeholder="Notes..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-input bg-background hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {interactions.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No activity logged for this deal yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions
            .sort(
              (a, b) =>
                new Date(b.occurred_at as string).getTime() -
                new Date(a.occurred_at as string).getTime()
            )
            .map((interaction) => {
              const Icon =
                INTERACTION_ICONS[interaction.type as string] ?? MessageSquare;
              return (
                <div
                  key={interaction.id as string}
                  className="flex gap-3 rounded-lg border p-3"
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {interaction.type as string}
                      </span>
                      {Boolean(interaction.subject) && (
                        <span className="text-sm">
                          — {interaction.subject as string}
                        </span>
                      )}
                    </div>
                    {Boolean(interaction.body) && (
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {interaction.body as string}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(interaction.occurred_at as string)}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
