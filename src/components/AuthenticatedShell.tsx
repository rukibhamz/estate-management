import { AppShell } from "./AppShell";
import { requireUser } from "@/lib/guard";
import { isSystemAdmin } from "@/server/branding";
import type { ReactNode } from "react";

export async function AuthenticatedShell({
  children,
  projectId,
  projectName,
}: {
  children: ReactNode;
  projectId?: string;
  projectName?: string;
}) {
  const user = await requireUser();
  return (
    <AppShell
      userName={user.name ?? user.email ?? "User"}
      isSystemAdmin={await isSystemAdmin(user.id)}
      projectId={projectId}
      projectName={projectName}
    >
      {children}
    </AppShell>
  );
}
