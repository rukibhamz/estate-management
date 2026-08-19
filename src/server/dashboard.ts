import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/guard";
import { addMoney, moneyString, subMoney } from "@/core/money";
import { isMilestoneOverdue } from "@/core/alerts";
import type { AssetType, PaymentStatus } from "@prisma/client";

export async function getDashboard(userId: string, projectId: string) {
  await requireCapability(userId, projectId, "report.read");
  const [units, lands, developments, sales, milestones] = await Promise.all([
    prisma.unit.groupBy({ by: ["status"], where: { projectId }, _count: true }),
    prisma.land.groupBy({ by: ["status"], where: { projectId }, _count: true }),
    prisma.development.findMany({
      where: { projectId, status: { not: "COMPLETE" } },
      include: { spendRecords: true, phases: true },
    }),
    prisma.saleAllocation.findMany({
      where: { projectId, commercialStatus: { not: "CANCELLED" } },
    }),
    prisma.milestone.findMany({ where: { projectId } }),
  ]);

  const agreed = addMoney(sales.map((s) => s.agreedValue.toString()));
  const paid = addMoney(sales.map((s) => s.totalPaid.toString()));
  const outstanding = sales.reduce(
    (acc, s) => addMoney([acc, subMoney(s.agreedValue.toString(), s.totalPaid.toString())]),
    "0.00",
  );

  return {
    unitCounts: units,
    landCounts: lands,
    developments: developments.map((d) => ({
      id: d.id,
      name: d.name,
      progressPct: d.progressPct,
      status: d.status,
      budget: d.approvedBudget?.toString() ?? "0.00",
      spend: addMoney(d.spendRecords.map((s) => s.amount.toString())),
    })),
    overdueMilestones: milestones.filter((m) => isMilestoneOverdue(m)),
    salesSummary: {
      count: sales.length,
      agreed: moneyString(agreed),
      paid: moneyString(paid),
      outstanding: moneyString(outstanding),
      partPayment: sales.filter((s) => s.paymentStatus === "PART_PAYMENT").length,
      fullPayment: sales.filter((s) => s.paymentStatus === "FULL_PAYMENT").length,
      overpaid: sales.filter((s) => s.isOverpaid).length,
    },
  };
}

export async function getSalesReport(
  userId: string,
  projectId: string,
  filters: {
    estateId?: string;
    developmentId?: string;
    paymentStatus?: string;
    assetType?: string;
  },
) {
  await requireCapability(userId, projectId, "report.read");
  return prisma.saleAllocation.findMany({
    where: {
      projectId,
      paymentStatus: (filters.paymentStatus as PaymentStatus | undefined) || undefined,
      assetType: (filters.assetType as AssetType | undefined) || undefined,
      unit: filters.estateId || filters.developmentId
        ? {
            estateId: filters.estateId || undefined,
            developmentId: filters.developmentId || undefined,
          }
        : undefined,
    },
    include: { unit: true, land: true, buyer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAudit(userId: string, projectId: string) {
  const membership = await requireCapability(userId, projectId, "audit.read");
  const logs = await prisma.statusActivityLog.findMany({
    where: { projectId },
    orderBy: { timestamp: "desc" },
    take: 200,
  });
  if (membership.scopes.length === 0) return logs;
  const allowedEstates = new Set(membership.scopes.map((s) => s.estateId).filter(Boolean));
  const units = await prisma.unit.findMany({
    where: { projectId, estateId: { in: [...allowedEstates] as string[] } },
    select: { id: true },
  });
  const unitIds = new Set(units.map((u) => u.id));
  return logs.filter((log) => {
    if (log.recordType === "Unit") return unitIds.has(log.recordId);
    if (log.recordType === "Project" || log.recordType === "ProjectMembership") return true;
    return false;
  });
}
