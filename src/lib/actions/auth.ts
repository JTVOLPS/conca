"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginFormData,
  type SignupFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@/lib/schemas/auth";

export async function signUp(
  formData: SignupFormData
): Promise<{ error: string | null }> {
  const parsed = signupSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { full_name, email, password, org_name } = parsed.data;
  const adminClient = createAdminClient();

  // 1. Create the org
  const { data: org, error: orgError } = await adminClient
    .from("orgs")
    .insert({ name: org_name, slug: slugify(org_name) })
    .select("id")
    .single();

  if (orgError) {
    return { error: orgError.message };
  }

  // 2. Sign up the user with app_metadata
  const { data: authData, error: signUpError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { org_id: org.id, role: "owner" },
      user_metadata: { full_name },
    });

  if (signUpError) {
    // Clean up the org if user creation failed
    await adminClient.from("orgs").delete().eq("id", org.id);
    return { error: signUpError.message };
  }

  // 3. Create user_profiles record (bypass RLS with admin client)
  const { error: profileError } = await adminClient
    .from("user_profiles")
    .insert({
      id: authData.user.id,
      org_id: org.id,
      role: "owner",
      full_name,
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // 4. Sign in the user so they have a session
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });

  redirect("/dashboard");
}

export async function signIn(
  formData: LoginFormData
): Promise<{ error: string | null }> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPasswordRequest(
  formData: ForgotPasswordFormData
): Promise<{ error: string | null; success: boolean }> {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  const { email } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function updatePassword(
  formData: ResetPasswordFormData
): Promise<{ error: string | null }> {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function acceptInvite(
  token: string,
  password: string,
  full_name: string
): Promise<{ error: string | null }> {
  const adminClient = createAdminClient();

  // 1. Look up the invitation by ID (token)
  const { data: invitation, error: inviteError } = await adminClient
    .from("invitations")
    .select("*")
    .eq("id", token)
    .is("accepted_at", null)
    .single();

  if (inviteError || !invitation) {
    return { error: "Invalid or expired invitation." };
  }

  // 2. Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "This invitation has expired." };
  }

  // 3. Create the user account via admin client
  const { data: authData, error: createError } =
    await adminClient.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      app_metadata: { org_id: invitation.org_id, role: invitation.role },
      user_metadata: { full_name },
    });

  if (createError) {
    return { error: createError.message };
  }

  // 4. Create user_profiles record
  const { error: profileError } = await adminClient
    .from("user_profiles")
    .insert({
      id: authData.user.id,
      org_id: invitation.org_id,
      role: invitation.role,
      full_name,
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // 5. Mark invitation as accepted
  await adminClient
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", token);

  // 6. Sign in the new user
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: invitation.email,
    password,
  });

  redirect("/dashboard");
}
