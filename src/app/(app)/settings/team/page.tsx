"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2, Mail } from "lucide-react";
import {
  getTeamMembers,
  getInvitations,
  createInvitation,
  deleteInvitation,
} from "@/lib/actions/invitations";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const [members, setMembers] = useState<
    Array<{
      id: string;
      full_name: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>
  >([]);
  const [invitations, setInvitations] = useState<
    Array<{
      id: string;
      email: string;
      role: string;
      expires_at: string;
      created_at: string;
    }>
  >([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [membersRes, invitesRes] = await Promise.all([
      getTeamMembers(),
      getInvitations(),
    ]);
    if (membersRes.data) setMembers(membersRes.data as typeof members);
    if (invitesRes.data) setInvitations(invitesRes.data as typeof invitations);
  }

  async function handleInvite() {
    setLoading(true);
    setError(null);
    const result = await createInvitation({ email, role });
    if (result.error) {
      setError(result.error);
    } else {
      setEmail("");
      setShowInvite(false);
      await loadData();
    }
    setLoading(false);
  }

  async function handleDeleteInvitation(id: string) {
    await deleteInvitation(id);
    await loadData();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage team members and invitations
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" />
          Invite
        </button>
      </div>

      {showInvite && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-sm font-medium">Invite Team Member</h3>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "member")}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={loading || !email}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-sm font-medium">
            Members ({members.length})
          </h2>
        </div>
        <div className="divide-y">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="text-sm font-medium">{member.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {member.role}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  member.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {member.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No team members yet
            </div>
          )}
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-sm font-medium">
              Pending Invitations ({invitations.length})
            </h2>
          </div>
          <div className="divide-y">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {invite.role} · Expires{" "}
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteInvitation(invite.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
