import { prisma } from "@/lib/prisma";
import { loadMembership, requireCapability } from "@/lib/guard";
import { putLocalObject, signedDownloadPath } from "@/lib/storage";
import type { DocCategory, LinkedType } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@/core/errors";
import { isResourceInScope } from "@/core/access";
import { SCOPED_ROLES } from "@/core/permissions";

export async function listDocuments(
  userId: string,
  projectId: string,
  linkedType?: LinkedType,
  linkedId?: string,
) {
  await requireCapability(userId, projectId, "document.read");
  return prisma.document.findMany({
    where: {
      projectId,
      ...(linkedType && linkedId ? { linkedType, linkedId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function uploadDocument(
  userId: string,
  projectId: string,
  input: {
    linkedType: LinkedType;
    linkedId: string;
    category?: DocCategory;
    description?: string;
    fileName: string;
    bytes: Buffer;
    estateId?: string | null;
    developmentId?: string | null;
  },
) {
  await requireCapability(userId, projectId, "document.write", {
    estateId: input.estateId,
    developmentId: input.developmentId,
  });
  const fileKey = `${projectId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await putLocalObject(fileKey, input.bytes);
  return prisma.document.create({
    data: {
      projectId,
      linkedType: input.linkedType,
      linkedId: input.linkedId,
      category: input.category ?? "OTHER",
      description: input.description,
      fileKey,
      uploadedBy: userId,
      saleId: input.linkedType === "SALE" ? input.linkedId : null,
    },
  });
}

export async function getDocumentDownload(
  userId: string,
  projectId: string,
  documentId: string,
) {
  const doc = await prisma.document.findFirst({ where: { id: documentId, projectId } });
  if (!doc) throw new NotFoundError();
  const membership = await loadMembership(userId, projectId);
  await requireCapability(userId, projectId, "document.read");
  if (membership && SCOPED_ROLES.includes(membership.role) && membership.scopes.length > 0) {
    const unit = await prisma.unit.findFirst({ where: { id: doc.linkedId, projectId } });
    const land = await prisma.land.findFirst({ where: { id: doc.linkedId, projectId } });
    const resource = {
      estateId: unit?.estateId ?? land?.estateId,
      developmentId: unit?.developmentId,
    };
    if (!isResourceInScope(membership.scopes, resource)) {
      throw new ForbiddenError("Outside assigned estate/development scope");
    }
  }
  return { path: signedDownloadPath(doc.fileKey), fileKey: doc.fileKey };
}
