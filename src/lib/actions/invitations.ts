"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inviteSchema, type InviteFormData } from "@/lib/schemas/auth";
import { sendEmail } from "@/lib/email/send";
import { invitationTemplate } from "@/lib/email/templates";

export async function createInvitation(formData: InviteFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = inviteSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { error: "No organization found" };

  // Check if already invited
  const { data: existing } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", parsed.data.email)
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .maybeSingle();

  if (existing) return { error: "This email has already been invited" };

  const { error } = await supabase.from("invitations").insert({
    org_id: orgId,
    email: parsed.data.email,
    role: parsed.data.role,
    invited_by: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (!error) {
    revalidatePath("/settings/team");

    // Send invitation email
    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // Get org name
      const { data: org } = await supabase
        .from("orgs")
        .select("name")
        .eq("id", orgId)
        .single();

      sendEmail({
        to: parsed.data.email,
        subject: `You've been invited to join ${org?.name ?? "a team"} on Conca`,
        html: invitationTemplate({
          orgName: org?.name ?? "a team",
          inviteeName: "",
          acceptUrl: `${appUrl}/invite/accept`,
        }),
      });
    } catch {
      // Email failure should not block invitation creation
    }
  }

  return { error: error?.message ?? null };
}

export async function acceptInvitation(
  invitationId: string,
  password: string,
  fullName: string
) {
  const admin = createAdminClient();

  // Get the invitation
  const { data: invitation, error: invError } = await admin
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .is("accepted_at", null)
    .single();

  if (invError || !invitation) {
    return { error: "Invalid or expired invitation" };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "This invitation has expired" };
  }

  // Create user with admin client
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    app_metadata: {
      org_id: invitation.org_id,
      role: invitation.role,
    },
  });

  if (authError) return { error: authError.message };

  // Create profile
  await admin.from("user_profiles").insert({
    id: authData.user.id,
    org_id: invitation.org_id,
    role: invitation.role,
    full_name: fullName,
  });

  // Mark invitation as accepted
  await admin
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitationId);

  return { error: null };
}

export async function getInvitations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function deleteInvitation(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id);

  if (!error) revalidatePath("/settings/team");
  return { error: error?.message ?? null };
}

export async function getTeamMembers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}
