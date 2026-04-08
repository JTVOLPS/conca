"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Edit,
  Mail,
  MapPin,
  MessageSquarePlus,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { deleteContact, linkContactCompany, unlinkContactCompany } from "@/lib/actions/contacts";
import { CONTACT_TYPES, INTERACTION_TYPES } from "@/lib/constants/contact-types";
import { formatDate, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { InteractionForm } from "@/components/contacts/interaction-form";
import { EntityTasksPanel } from "@/components/tasks/entity-tasks-panel";

interface ContactCompany {
  id: string;
  company_id: string;
  role: string | null;
  is_primary: boolean;
  companies: { id: string; name: string; type: string | null } | null;
}

interface Interaction {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  occurred_at: string;
  logged_by: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  title: string | null;
  type: string | null;
  source: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  contact_companies: ContactCompany[];
  interactions: Interaction[];
}

interface CompanyOption {
  id: string;
  name: string;
}

interface ContactDetailClientProps {
  contact: Contact;
  allCompanies: CompanyOption[];
}

export function ContactDetailClient({
  contact,
  allCompanies,
}: ContactDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLinkCompanyDialog, setShowLinkCompanyDialog] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [linkCompanyId, setLinkCompanyId] = useState("");
  const [linkRole, setLinkRole] = useState("");

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const typeLabel = contact.type
    ? CONTACT_TYPES.find((t) => t.value === contact.type)?.label ?? contact.type
    : null;

  const hasAddress =
    contact.address_line1 || contact.city || contact.state || contact.zip;

  const addressParts = [
    contact.address_line1,
    contact.address_line2,
    [contact.city, contact.state].filter(Boolean).join(", "),
    contact.zip,
  ].filter(Boolean);

  // Filter out companies already linked
  const linkedCompanyIds = new Set(
    contact.contact_companies.map((cc) => cc.company_id)
  );
  const availableCompanies = allCompanies.filter(
    (c) => !linkedCompanyIds.has(c.id)
  );

  async function handleDelete() {
    const result = await deleteContact(contact.id);
    if (!result.error) {
      router.push("/contacts");
    }
  }

  async function handleLinkCompany() {
    if (!linkCompanyId) return;
    const result = await linkContactCompany(
      contact.id,
      linkCompanyId,
      linkRole || undefined
    );
    if (!result.error) {
      setShowLinkCompanyDialog(false);
      setLinkCompanyId("");
      setLinkRole("");
      startTransition(() => router.refresh());
    }
  }

  async function handleUnlinkCompany(id: string) {
    const result = await unlinkContactCompany(id);
    if (!result.error) {
      startTransition(() => router.refresh());
    }
  }

  function handleInteractionSuccess() {
    setShowInteractionForm(false);
    startTransition(() => router.refresh());
  }

  // Sort interactions newest first
  const sortedInteractions = [...contact.interactions].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title={fullName} description={contact.title || undefined}>
        <Link href="/contacts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Link href={`/contacts/${contact.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </PageHeader>

      {/* Type Badge & Quick Info */}
      <div className="flex flex-wrap items-center gap-3">
        {typeLabel && <Badge variant="secondary">{typeLabel}</Badge>}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            {contact.email}
          </a>
        )}
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Phone className="h-3.5 w-3.5" />
            {contact.phone}
          </a>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{contact.email || "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{contact.phone || "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Mobile</dt>
                  <dd>{contact.mobile || "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Source</dt>
                  <dd>{contact.source || "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(contact.created_at)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Address */}
          {hasAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    {addressParts.map((part, i) => (
                      <div key={i}>{part}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - companies & interactions */}
        <div className="space-y-6">
          {/* Associated Companies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Companies</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLinkCompanyDialog(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {contact.contact_companies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No companies linked yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {contact.contact_companies.map((cc) => (
                    <div
                      key={cc.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium">
                          {cc.companies
                            ? getInitials(cc.companies.name)
                            : "?"}
                        </div>
                        <div className="min-w-0">
                          {cc.companies ? (
                            <Link
                              href={`/companies/${cc.companies.id}`}
                              className="text-sm font-medium hover:underline truncate block"
                            >
                              {cc.companies.name}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Unknown
                            </span>
                          )}
                          {cc.role && (
                            <p className="text-xs text-muted-foreground">
                              {cc.role}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleUnlinkCompany(cc.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Interactions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInteractionForm(!showInteractionForm)}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Log
              </Button>
            </CardHeader>
            <CardContent>
              {showInteractionForm && (
                <div className="mb-4 rounded-md border p-3">
                  <InteractionForm
                    contactId={contact.id}
                    onSuccess={handleInteractionSuccess}
                  />
                </div>
              )}
              {sortedInteractions.length === 0 ? (
                <EmptyState
                  icon={<MessageSquarePlus className="h-5 w-5" />}
                  title="No interactions yet"
                  description="Log a call, email, or meeting."
                />
              ) : (
                <div className="space-y-4">
                  {sortedInteractions.map((interaction) => {
                    const typeInfo = INTERACTION_TYPES.find(
                      (t) => t.value === interaction.type
                    );
                    return (
                      <div key={interaction.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {typeInfo?.label ?? interaction.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(interaction.occurred_at)}
                          </span>
                        </div>
                        {interaction.subject && (
                          <p className="text-sm font-medium">
                            {interaction.subject}
                          </p>
                        )}
                        {interaction.body && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {interaction.body}
                          </p>
                        )}
                        <Separator />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityTasksPanel entityType="contact" entityId={contact.id} />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Contact"
        description={`Are you sure you want to delete ${fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* Link company dialog */}
      <Dialog
        open={showLinkCompanyDialog}
        onOpenChange={setShowLinkCompanyDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={linkCompanyId}
                onChange={(e) => setLinkCompanyId(e.target.value)}
              >
                <option value="">Select a company...</option>
                {availableCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Role (optional)</Label>
              <Input
                placeholder="e.g., Partner, Analyst"
                value={linkRole}
                onChange={(e) => setLinkRole(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkCompanyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkCompany}
              disabled={!linkCompanyId || isPending}
            >
              Link Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
