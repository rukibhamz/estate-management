import { prisma } from "@/lib/prisma";
import { requireCapability, writeAuditLog } from "@/lib/guard";
import { AUDIT_ACTIONS } from "@/core/audit";
import { DomainError, NotFoundError } from "@/core/errors";
import type { LandStatus, UnitStatus } from "@prisma/client";

export async function listInventory(
  userId: string,
  projectId: string,
  filters?: {
    estateId?: string;
    developmentId?: string;
    status?: string;
    unitRef?: string;
    type?: string;
  },
) {
  await requireCapability(userId, projectId, "unit.read");
  return prisma.unit.findMany({
    where: {
      projectId,
      estateId: filters?.estateId || undefined,
      developmentId: filters?.developmentId || undefined,
      status: (filters?.status as UnitStatus | undefined) || undefined,
      type: filters?.type || undefined,
      unitRef: filters?.unitRef ? { contains: filters.unitRef } : undefined,
    },
    include: { estate: true, building: true, development: true },
    orderBy: { unitRef: "asc" },
  });
}

export async function createEstate(
  userId: string,
  projectId: string,
  input: { name: string; location?: string; description?: string },
) {
  await requireCapability(userId, projectId, "estate.write");
  return prisma.estate.create({ data: { projectId, ...input, name: input.name.trim() } });
}

export async function createLand(
  userId: string,
  projectId: string,
  input: {
    estateId?: string;
    location?: string;
    size?: string;
    titleStatus?: string;
    acquisitionSource?: string;
    acquisitionValue?: string;
    notes?: string;
  },
) {
  await requireCapability(userId, projectId, "land.write", { estateId: input.estateId });
  return prisma.land.create({
    data: {
      projectId,
      estateId: input.estateId || null,
      location: input.location,
      size: input.size,
      titleStatus: input.titleStatus,
      acquisitionSource: input.acquisitionSource,
      acquisitionValue: input.acquisitionValue,
      notes: input.notes,
    },
  });
}

export async function createBuilding(
  userId: string,
  projectId: string,
  input: { name: string; estateId?: string; developmentId?: string },
) {
  await requireCapability(userId, projectId, "building.write", {
    estateId: input.estateId,
    developmentId: input.developmentId,
  });
  return prisma.building.create({
    data: {
      projectId,
      name: input.name.trim(),
      estateId: input.estateId || null,
      developmentId: input.developmentId || null,
    },
  });
}

export async function createUnit(
  userId: string,
  projectId: string,
  input: {
    unitRef: string;
    type?: string;
    size?: string;
    estateId?: string;
    developmentId?: string;
    buildingId?: string;
    landId?: string;
    status?: UnitStatus;
  },
) {
  await requireCapability(userId, projectId, "unit.write", {
    estateId: input.estateId,
    developmentId: input.developmentId,
  });
  return prisma.unit.create({
    data: {
      projectId,
      unitRef: input.unitRef.trim(),
      type: input.type,
      size: input.size,
      estateId: input.estateId || null,
      developmentId: input.developmentId || null,
      buildingId: input.buildingId || null,
      landId: input.landId || null,
      status: input.status ?? "UNDER_CONSTRUCTION",
    },
  });
}

export async function changeUnitStatus(
  userId: string,
  projectId: string,
  unitId: string,
  status: UnitStatus,
) {
  const unit = await prisma.unit.findFirst({ where: { id: unitId, projectId } });
  if (!unit) throw new NotFoundError();
  await requireCapability(userId, projectId, "unit.write", {
    estateId: unit.estateId,
    developmentId: unit.developmentId,
  });
  if (unit.status === status) return unit;
  const updated = await prisma.unit.update({
    where: { id: unitId },
    data: { status },
  });
  await writeAuditLog({
    projectId,
    recordType: "Unit",
    recordId: unitId,
    action: AUDIT_ACTIONS.STATUS_CHANGE,
    changedBy: userId,
    oldValue: { status: unit.status },
    newValue: { status },
  });
  return updated;
}

export async function changeLandStatus(
  userId: string,
  projectId: string,
  landId: string,
  status: LandStatus,
) {
  const land = await prisma.land.findFirst({ where: { id: landId, projectId } });
  if (!land) throw new NotFoundError();
  await requireCapability(userId, projectId, "land.write", { estateId: land.estateId });
  const updated = await prisma.land.update({ where: { id: landId }, data: { status } });
  await writeAuditLog({
    projectId,
    recordType: "Land",
    recordId: landId,
    action: AUDIT_ACTIONS.STATUS_CHANGE,
    changedBy: userId,
    oldValue: { status: land.status },
    newValue: { status },
  });
  return updated;
}

export async function confirmLinkLandToDevelopment(
  userId: string,
  projectId: string,
  developmentId: string,
  landId: string,
) {
  const development = await prisma.development.findFirst({
    where: { id: developmentId, projectId },
  });
  const land = await prisma.land.findFirst({ where: { id: landId, projectId } });
  if (!development || !land) throw new NotFoundError();
  await requireCapability(userId, projectId, "development.write", {
    estateId: development.estateId,
    developmentId,
  });
  await prisma.$transaction([
    prisma.developmentLand.create({
      data: { developmentId, landId, projectId },
    }),
    prisma.land.update({
      where: { id: landId },
      data: { status: "UNDER_DEVELOPMENT", previousStatus: land.status },
    }),
  ]);
}

export async function loadProjectAssets(userId: string, projectId: string) {
  await requireCapability(userId, projectId, "estate.read");
  const [estates, lands, buildings, units] = await Promise.all([
    prisma.estate.findMany({ where: { projectId }, orderBy: { name: "asc" } }),
    prisma.land.findMany({ where: { projectId }, include: { estate: true }, orderBy: { createdAt: "desc" } }),
    prisma.building.findMany({ where: { projectId }, orderBy: { name: "asc" } }),
    prisma.unit.findMany({
      where: { projectId },
      include: { estate: true, building: true, development: true },
      orderBy: { unitRef: "asc" },
    }),
  ]);
  return { estates, lands, buildings, units };
}

export function assertOptionalBuilding(buildingId?: string | null) {
  if (buildingId === undefined) throw new DomainError("invalid", "INVALID");
}
