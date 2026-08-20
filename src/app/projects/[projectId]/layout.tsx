import { requireUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { loadActiveOrgMembership } from "@/server/organizations";
import { notFound, redirect } from "next/navigation";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const orgMember = await loadActiveOrgMembership(user.id, project.organizationId);
  if (!orgMember) redirect("/projects");

  const membership = await prisma.projectMembership.findFirst({
    where: { projectId, userId: user.id, status: "ACTIVE" },
  });
  if (!membership) redirect("/projects");

  return children;
}
