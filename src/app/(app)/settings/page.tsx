import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase
    .from("orgs")
    .select("*")
    .eq("id", user.app_metadata?.org_id)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings
        </p>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-medium">Organization</h2>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <p className="text-sm text-muted-foreground mt-1">
              {org?.name ?? "—"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Slug</label>
            <p className="text-sm text-muted-foreground mt-1">
              {org?.slug ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-medium">Your Profile</h2>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {user.app_metadata?.role ?? "member"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
