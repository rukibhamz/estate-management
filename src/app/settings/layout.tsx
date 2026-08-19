import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { requireUser } from "@/lib/guard";
import { isSystemAdmin } from "@/server/branding";
import { redirect } from "next/navigation";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!(await isSystemAdmin(user.id))) redirect("/projects");
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
