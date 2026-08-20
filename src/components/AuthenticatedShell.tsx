import { AppShell } from "./AppShell";
import { requireUser } from "@/lib/guard";
import { isPlatformAdmin } from "@/server/platform";
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
      isSystemAdmin={await isPlatformAdmin(user.id)}
      projectId={projectId}
      projectName={projectName}
    >
      {children}
    </AppShell>
  );
}
