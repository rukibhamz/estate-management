import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { requireUser } from "@/lib/guard";
import { isPlatformAdmin } from "@/server/platform";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!(await isPlatformAdmin(user.id))) redirect("/projects");
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
