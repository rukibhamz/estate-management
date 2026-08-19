import { requireUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, memberships: { some: { userId: user.id, status: "ACTIVE" } } },
  });
  if (!project) notFound();

  return children;
}
