import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/guard";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell userName={user.name ?? user.email ?? "User"}>{children}</AppShell>
  );
}
