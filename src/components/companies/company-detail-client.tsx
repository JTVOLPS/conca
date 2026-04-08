"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageSquarePlus,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { deleteCompany } from "@/lib/actions/companies";
import { unlinkContactCompany } from "@/lib/actions/contacts";
import {
  COMPANY_TYPES,
  CONTACT_TYPES,
  INTERACTION_TYPES,
} from "@/lib/constants/contact-types";
import { formatDate, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InteractionForm } from "@/components/contacts/interaction-form";
import { EntityTasksPanel } from "@/components/tasks/entity-tasks-panel";

interface ContactCompany {
  id: string;
  contact_id: string;
  role: string | null;
  is_primary: boolean;
  contacts: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    type: string | null;
  } | null;
}

interface Interaction {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  occurred_at: string;
  logged_by: string;
}

interface Company {
  id: string;
  name: string;
  type: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
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

interface CompanyDetailClientProps {
  company: Company;
}

export function CompanyDetailClient({ company }: CompanyDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  const typeLabel = company.type
    ? COMPANY_TYPES.find((t) => t.value === company.type)?.label ?? company.type
    : null;

  const hasAddress =
    company.address_line1 || company.city || company.state || company.zip;

  const addressParts = [
    company.address_line1,
    company.address_line2,
    [company.city, company.state].filter(Boolean).join(", "),
    company.zip,
  ].filter(Boolean);

  async function handleDelete() {
    const result = await deleteCompany(company.id);
    if (!result.error) {
      router.push("/companies");
    }
  }

  async function handleUnlinkContact(linkId: string) {
    const result = await unlinkContactCompany(linkId);
    if (!result.error) {
      startTransition(() => router.refresh());
    }
  }

  function handleInteractionSuccess() {
    setShowInteractionForm(false);
    startTransition(() => router.refresh());
  }

  // Sort interactions newest first
  const sortedInteractions = [...company.interactions].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title={company.name} description={typeLabel ?? undefined}>
        <Link href="/companies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Link href={`/companies/${company.id}/edit`}>
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

      {/* Quick info row */}
      <div className="flex flex-wrap items-center gap-3">
        {typeLabel && <Badge variant="secondary">{typeLabel}</Badge>}
        {company.email && (
          <a
            href={`mailto:${company.email}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            {company.email}
          </a>
        )}
        {company.phone && (
          <a
            href={`tel:${company.phone}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Phone className="h-3.5 w-3.5" />
            {company.phone}
          </a>
        )}
        {company.website && (
          <a
            href={
              company.website.startsWith("http")
                ? company.website
                : `https://${company.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {company.website}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{company.email || "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{company.phone || "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>
                    {company.website ? (
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      "\u2014"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(company.created_at)}</dd>
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
          {company.tags && company.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {company.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {company.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Linked Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {company.contact_companies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No contacts linked yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {company.contact_companies.map((cc) => {
                    const contact = cc.contacts;
                    if (!contact) return null;
                    const contactType = contact.type
                      ? CONTACT_TYPES.find((t) => t.value === contact.type)
                          ?.label
                      : null;
                    return (
                      <div
                        key={cc.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                            {getInitials(
                              `${contact.first_name} ${contact.last_name}`
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="text-sm font-medium hover:underline truncate block"
                            >
                              {contact.first_name} {contact.last_name}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {cc.role && <span>{cc.role}</span>}
                              {cc.role && contactType && <span>&middot;</span>}
                              {contactType && <span>{contactType}</span>}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleUnlinkContact(cc.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
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
                    companyId={company.id}
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
          <EntityTasksPanel entityType="company" entityId={company.id} />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Company"
        description={`Are you sure you want to delete ${company.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
