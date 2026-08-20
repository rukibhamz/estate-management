import { AppShell } from "./AppShell";
import { requireUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
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
  const memberships = await prisma.projectMembership.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    select: { projectId: true },
  });
  const memberProjectIds = memberships.map((m) => m.projectId);

  return (
    <AppShell
      userName={user.name ?? user.email ?? "User"}
      isSystemAdmin={await isPlatformAdmin(user.id)}
      memberProjectIds={memberProjectIds}
      projectId={projectId}
      projectName={projectName}
    >
      {children}
    </AppShell>
  );
}
