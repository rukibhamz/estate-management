import { prisma } from "@/lib/prisma";
import { requireCapability, writeAuditLog } from "@/lib/guard";
import { ForbiddenError, NotFoundError } from "@/core/errors";
import {
  computeBudgetVariance,
  remainingUnitsToGenerate,
  rollupDevelopmentProgress,
} from "@/core/development";
import { AUDIT_ACTIONS } from "@/core/audit";
import { isMilestoneOverdue } from "@/core/alerts";

export async function listDevelopments(userId: string, projectId: string) {
  await requireCapability(userId, projectId, "development.read");
  return prisma.development.findMany({
    where: { projectId },
    include: {
      lands: { include: { land: true } },
      phases: { include: { milestones: true, spendRecords: true } },
      spendRecords: true,
      _count: { select: { units: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDevelopment(
  userId: string,
  projectId: string,
  input: {
    name: string;
    estateId?: string;
    description?: string;
    plannedUnitCount?: number;
    approvedBudget?: string;
    landIds: string[];
  },
) {
  await requireCapability(userId, projectId, "development.write", { estateId: input.estateId });
  return prisma.$transaction(async (tx) => {
    const development = await tx.development.create({
      data: {
        projectId,
        name: input.name.trim(),
        estateId: input.estateId || null,
        description: input.description,
        plannedUnitCount: input.plannedUnitCount,
        approvedBudget: input.approvedBudget,
        status: "PLANNED",
      },
    });
    for (const landId of input.landIds) {
      const land = await tx.land.findFirst({ where: { id: landId, projectId } });
      if (!land) continue;
      await tx.developmentLand.create({
        data: { developmentId: development.id, landId, projectId },
      });
      await tx.land.update({
        where: { id: landId },
        data: { status: "UNDER_DEVELOPMENT", previousStatus: land.status },
      });
    }
    return development;
  });
}

export async function addPhase(
  userId: string,
  projectId: string,
  developmentId: string,
  input: { name: string; weight?: number; budget?: string; targetDate?: string },
) {
  const development = await prisma.development.findFirst({ where: { id: developmentId, projectId } });
  if (!development) throw new NotFoundError();
  await requireCapability(userId, projectId, "phase.write", {
    estateId: development.estateId,
    developmentId,
  });
  const phase = await prisma.phase.create({
    data: {
      projectId,
      developmentId,
      name: input.name.trim(),
      weight: input.weight,
      budget: input.budget,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    },
  });
  await refreshRollup(developmentId);
  return phase;
}

export async function updatePhaseProgress(
  userId: string,
  projectId: string,
  phaseId: string,
  progressPct: number,
) {
  const phase = await prisma.phase.findFirst({ where: { id: phaseId, projectId } });
  if (!phase) throw new NotFoundError();
  await requireCapability(userId, projectId, "phase.write", { developmentId: phase.developmentId });
  await prisma.phase.update({
    where: { id: phaseId },
    data: { progressPct, status: progressPct >= 100 ? "COMPLETE" : "IN_PROGRESS" },
  });
  return refreshRollup(phase.developmentId);
}

async function refreshRollup(developmentId: string) {
  const phases = await prisma.phase.findMany({ where: { developmentId } });
  const progressPct = rollupDevelopmentProgress(phases);
  return prisma.development.update({ where: { id: developmentId }, data: { progressPct } });
}

export async function addMilestone(
  userId: string,
  projectId: string,
  phaseId: string,
  input: { description: string; targetDate?: string },
) {
  const phase = await prisma.phase.findFirst({ where: { id: phaseId, projectId } });
  if (!phase) throw new NotFoundError();
  await requireCapability(userId, projectId, "milestone.write", { developmentId: phase.developmentId });
  return prisma.milestone.create({
    data: {
      projectId,
      phaseId,
      description: input.description.trim(),
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    },
  });
}

export async function addSpend(
  userId: string,
  projectId: string,
  input: { developmentId: string; phaseId?: string; amount: string; date: string; category?: string },
) {
  const development = await prisma.development.findFirst({
    where: { id: input.developmentId, projectId },
  });
  if (!development) throw new NotFoundError();
  await requireCapability(userId, projectId, "spend.write", {
    estateId: development.estateId,
    developmentId: input.developmentId,
  });
  return prisma.spendRecord.create({
    data: {
      projectId,
      developmentId: input.developmentId,
      phaseId: input.phaseId || null,
      amount: input.amount,
      date: new Date(input.date),
      category: input.category,
      createdBy: userId,
    },
  });
}

export async function addProgressUpdate(
  userId: string,
  projectId: string,
  input: { developmentId: string; phaseId?: string; progressPct: number; note?: string },
) {
  await requireCapability(userId, projectId, "progress.write", { developmentId: input.developmentId });
  return prisma.progressUpdate.create({
    data: {
      projectId,
      developmentId: input.developmentId,
      phaseId: input.phaseId || null,
      progressPct: input.progressPct,
      note: input.note,
      createdBy: userId,
    },
  });
}

export async function addContractor(
  userId: string,
  projectId: string,
  input: { name: string; contact?: string; role?: string; developmentId?: string },
) {
  await requireCapability(userId, projectId, "contractor.write");
  const contractor = await prisma.contractor.create({
    data: { projectId, name: input.name.trim(), contact: input.contact, role: input.role },
  });
  if (input.developmentId) {
    await prisma.developmentContractor.create({
      data: {
        developmentId: input.developmentId,
        contractorId: contractor.id,
        projectId,
      },
    });
  }
  return contractor;
}

export async function proposeCompletion(userId: string, projectId: string, developmentId: string) {
  const development = await prisma.development.findFirst({ where: { id: developmentId, projectId } });
  if (!development) throw new NotFoundError();
  await requireCapability(userId, projectId, "development.proposeComplete", {
    estateId: development.estateId,
    developmentId,
  });
  return prisma.development.update({
    where: { id: developmentId },
    data: { status: "COMPLETE_PENDING_APPROVAL" },
  });
}

export async function approveCompletion(userId: string, projectId: string, developmentId: string) {
  const membership = await requireCapability(userId, projectId, "development.approveComplete");
  if (membership.role !== "OWNER_ADMIN") {
    throw new ForbiddenError("Only Owner/Admin can approve completion");
  }
  const development = await prisma.development.findFirst({
    where: { id: developmentId, projectId },
    include: { lands: true, units: true },
  });
  if (!development) throw new NotFoundError();
  const remaining = remainingUnitsToGenerate(development.plannedUnitCount, development.units.length);
  const singleLandId = development.lands.length === 1 ? development.lands[0].landId : null;
  const created = await prisma.$transaction(async (tx) => {
    const units = [];
    for (let i = 0; i < remaining; i += 1) {
      const seq = development.units.length + i + 1;
      const unit = await tx.unit.create({
        data: {
          projectId,
          developmentId,
          estateId: development.estateId,
          landId: singleLandId,
          unitRef: `${development.name.replace(/\s+/g, "-").toUpperCase()}-${String(seq).padStart(3, "0")}`,
          status: "AVAILABLE",
        },
      });
      units.push(unit);
    }
    await tx.development.update({
      where: { id: developmentId },
      data: { status: "COMPLETE", progressPct: 100 },
    });
    return units;
  });
  await writeAuditLog({
    projectId,
    recordType: "Development",
    recordId: developmentId,
    action: AUDIT_ACTIONS.STATUS_CHANGE,
    changedBy: userId,
    oldValue: { status: development.status },
    newValue: { status: "COMPLETE", generated: created.length },
  });
  return created;
}

export function varianceFor(development: {
  approvedBudget: { toString(): string } | null;
  spendRecords: Array<{ amount: { toString(): string } }>;
  phases: Array<{ id: string; budget: { toString(): string } | null; spendRecords: Array<{ amount: { toString(): string } }> }>;
}) {
  const spend = development.spendRecords.reduce((s, r) => s + Number(r.amount.toString()), 0);
  const overall = computeBudgetVariance(development.approvedBudget?.toString() ?? null, spend);
  const phases = development.phases.map((phase) => {
    const phaseSpend = phase.spendRecords.reduce((s, r) => s + Number(r.amount.toString()), 0);
    return { phaseId: phase.id, ...computeBudgetVariance(phase.budget?.toString() ?? null, phaseSpend) };
  });
  return { overall, phases };
}

export function overdueMilestones(
  milestones: Array<{ status: string; targetDate: Date | null }>,
) {
  return milestones.filter((m) => isMilestoneOverdue(m));
}
