"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, X, Users, Loader2 } from "lucide-react";
import { linkDealContact, unlinkDealContact } from "@/lib/actions/deals";
import { getContacts } from "@/lib/actions/contacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";

interface DealContact {
  id: string;
  contact_id: string;
  role: string | null;
  contacts: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    type: string | null;
  };
}

interface DealContactsPanelProps {
  dealId: string;
  contacts: DealContact[];
}

export function DealContactsPanel({
  dealId,
  contacts,
}: DealContactsPanelProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      first_name: string;
      last_name: string;
      email: string | null;
    }>
  >([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const { data } = await getContacts({ search: q, pageSize: 10 });
    setSearchResults(
      (data ?? []).map(
        (c: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
        }) => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
        })
      )
    );
  }

  async function handleAdd(contactId: string) {
    setLoading(true);
    try {
      const result = await linkDealContact(dealId, contactId, role || undefined);
      if (result.error) {
        alert(result.error);
        return;
      }
      setShowDialog(false);
      setSearch("");
      setRole("");
      setSearchResults([]);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(linkId: string) {
    setRemoving(linkId);
    try {
      const result = await unlinkDealContact(linkId, dealId);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Linked Contacts ({contacts.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowDialog(true)}>
          <UserPlus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact to Deal</DialogTitle>
            <DialogDescription>
              Search for a contact and assign a role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Contacts</Label>
              <Input
                placeholder="Type to search..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                placeholder="e.g., Seller, Buyer, Lender..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                {searchResults.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleAdd(contact.id)}
                    disabled={loading}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent text-left disabled:opacity-50"
                  >
                    <span className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {contact.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {search.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No contacts found.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No contacts linked"
          description="Add contacts to track stakeholders involved in this deal."
        />
      ) : (
        <div className="divide-y rounded-lg border">
          {contacts.map((link) => {
            const contact = link.contacts;
            if (!contact) return null;
            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {contact.first_name?.[0]}
                    {contact.last_name?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {contact.first_name} {contact.last_name}
                      </Link>
                      {link.role && (
                        <Badge variant="secondary" className="text-xs">
                          {link.role}
                        </Badge>
                      )}
                    </div>
                    {contact.email && (
                      <p className="text-xs text-muted-foreground">
                        {contact.email}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(link.id)}
                  disabled={removing === link.id}
                >
                  {removing === link.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
