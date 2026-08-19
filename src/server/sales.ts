import { prisma } from "@/lib/prisma";
import { requireCapability, writeAuditLog } from "@/lib/guard";
import { AUDIT_ACTIONS } from "@/core/audit";
import { DomainError, ForbiddenError, NotFoundError } from "@/core/errors";
import {
  assertCommercialTransition,
  assertSaleAssetXor,
  inventoryOnHold,
  restoreInventoryStatus,
  type CommercialStatus,
} from "@/core/sales";
import { assertRefundNote, canEditPayment, paymentEditWindowHours, recalculatePaymentStatus } from "@/core/payments";
import { roleAllows } from "@/core/permissions";

async function persistPaymentStatus(saleId: string) {
  const sale = await prisma.saleAllocation.findUnique({
    where: { id: saleId },
    include: { payments: { where: { deletedAt: null } } },
  });
  if (!sale) throw new NotFoundError();
  const calc = recalculatePaymentStatus({
    agreedValue: sale.agreedValue.toString(),
    amounts: sale.payments.map((p) => p.amount.toString()),
  });
  return prisma.saleAllocation.update({
    where: { id: saleId },
    data: {
      totalPaid: calc.totalPaid,
      isOverpaid: calc.isOverpaid,
      paymentStatus: calc.paymentStatus,
    },
  });
}

export async function createBuyer(
  userId: string,
  projectId: string,
  input: { name: string; phone?: string; email?: string },
) {
  await requireCapability(userId, projectId, "buyer.write");
  return prisma.buyerContact.create({
    data: { projectId, name: input.name.trim(), phone: input.phone, email: input.email },
  });
}

export async function createSale(
  userId: string,
  projectId: string,
  input: {
    unitId?: string;
    landId?: string;
    buyerId?: string;
    agreedValue: string;
    applyInventory?: boolean;
  },
) {
  await requireCapability(userId, projectId, "sale.write");
  assertSaleAssetXor(input.unitId, input.landId);
  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.saleAllocation.create({
      data: {
        projectId,
        assetType: input.unitId ? "UNIT" : "LAND",
        unitId: input.unitId || null,
        landId: input.landId || null,
        buyerId: input.buyerId || null,
        agreedValue: input.agreedValue,
        commercialStatus: "RESERVED",
        paymentStatus: "NOT_APPLICABLE",
        assignedUserId: userId,
      },
    });
    if (input.applyInventory !== false) {
      if (input.unitId) {
        const unit = await tx.unit.findFirst({ where: { id: input.unitId, projectId } });
        if (!unit) throw new NotFoundError("Unit not found");
        await tx.unit.update({
          where: { id: unit.id },
          data: {
            previousStatus: unit.status,
            status: inventoryOnHold("UNIT", "RESERVED"),
          },
        });
      }
      if (input.landId) {
        const land = await tx.land.findFirst({ where: { id: input.landId, projectId } });
        if (!land) throw new NotFoundError("Land not found");
        await tx.land.update({
          where: { id: land.id },
          data: {
            previousStatus: land.status,
            status: inventoryOnHold("LAND", "RESERVED"),
          },
        });
      }
    }
    return created;
  });
  return sale;
}

export async function transitionSale(
  userId: string,
  projectId: string,
  saleId: string,
  to: CommercialStatus,
  reason?: string,
) {
  const sale = await prisma.saleAllocation.findFirst({
    where: { id: saleId, projectId },
    include: { unit: true, land: true },
  });
  if (!sale) throw new NotFoundError();
  const membership = await requireCapability(
    userId,
    projectId,
    to === "SOLD" && sale.commercialStatus === "SOLD" ? "sale.reopenSold" : "sale.write",
  );
  const actorIsOwnerAdmin = membership.role === "OWNER_ADMIN";
  if (sale.commercialStatus === "SOLD" && to !== "SOLD") {
    if (!roleAllows(membership.role, "sale.reopenSold")) {
      throw new ForbiddenError("Only Owner/Admin can reopen a SOLD sale");
    }
  }
  assertCommercialTransition({
    from: sale.commercialStatus,
    to,
    actorIsOwnerAdmin,
    reason,
  });
  await prisma.$transaction(async (tx) => {
    await tx.saleAllocation.update({
      where: { id: saleId },
      data: {
        commercialStatus: to,
        cancellationReason: to === "CANCELLED" ? reason : sale.cancellationReason,
      },
    });
    if (to === "SOLD" || to === "ALLOCATED" || to === "CANCELLED") {
      if (sale.unit) {
        const status =
          to === "CANCELLED"
            ? restoreInventoryStatus(sale.unit.previousStatus, "AVAILABLE")
            : to === "SOLD"
              ? "SOLD"
              : "ALLOCATED";
        await tx.unit.update({
          where: { id: sale.unit.id },
          data: {
            status,
            previousStatus: to === "CANCELLED" ? null : sale.unit.previousStatus,
          },
        });
      }
      if (sale.land) {
        const status =
          to === "CANCELLED"
            ? restoreInventoryStatus(sale.land.previousStatus, "AVAILABLE")
            : to === "SOLD"
              ? "SOLD"
              : "RESERVED";
        await tx.land.update({
          where: { id: sale.land.id },
          data: {
            status,
            previousStatus: to === "CANCELLED" ? null : sale.land.previousStatus,
          },
        });
      }
    }
  });
  await writeAuditLog({
    projectId,
    recordType: "SaleAllocation",
    recordId: saleId,
    action: AUDIT_ACTIONS.SALE_STATUS_CHANGE,
    changedBy: userId,
    oldValue: { status: sale.commercialStatus },
    newValue: { status: to, reason: reason ?? null },
  });
  return persistPaymentStatus(saleId);
}

export async function recordPayment(
  userId: string,
  projectId: string,
  input: {
    saleId: string;
    amount: string;
    paymentDate: string;
    method?: string;
    reference?: string;
    note?: string;
  },
) {
  await requireCapability(userId, projectId, "payment.create");
  assertRefundNote(input.amount, input.note);
  const hours = paymentEditWindowHours();
  const payment = await prisma.paymentRecord.create({
    data: {
      projectId,
      saleId: input.saleId,
      amount: input.amount,
      paymentDate: new Date(input.paymentDate),
      method: input.method,
      reference: input.reference,
      note: input.note,
      recordedBy: userId,
      editableUntil: new Date(Date.now() + hours * 60 * 60 * 1000),
    },
  });
  await writeAuditLog({
    projectId,
    recordType: "PaymentRecord",
    recordId: payment.id,
    action: AUDIT_ACTIONS.PAYMENT_CREATE,
    changedBy: userId,
    newValue: { amount: input.amount },
  });
  await persistPaymentStatus(input.saleId);
  return payment;
}

export async function editPayment(
  userId: string,
  projectId: string,
  paymentId: string,
  amount: string,
  note?: string,
) {
  const payment = await prisma.paymentRecord.findFirst({ where: { id: paymentId, projectId } });
  if (!payment || payment.deletedAt) throw new NotFoundError();
  const membership = await requireCapability(userId, projectId, "payment.editOwn24h");
  const canAny = roleAllows(membership.role, "payment.editAny");
  if (!canEditPayment({
    actorId: userId,
    recordedBy: payment.recordedBy,
    editableUntil: payment.editableUntil,
    now: new Date(),
    canEditAny: canAny,
  })) {
    throw new ForbiddenError("Payment is outside the 24h edit window");
  }
  assertRefundNote(amount, note ?? payment.note);
  const updated = await prisma.paymentRecord.update({
    where: { id: paymentId },
    data: { amount, note },
  });
  await writeAuditLog({
    projectId,
    recordType: "PaymentRecord",
    recordId: paymentId,
    action: AUDIT_ACTIONS.PAYMENT_EDIT,
    changedBy: userId,
    oldValue: { amount: payment.amount.toString() },
    newValue: { amount },
  });
  await persistPaymentStatus(payment.saleId);
  return updated;
}

export async function deletePayment(
  userId: string,
  projectId: string,
  paymentId: string,
  reason: string,
) {
  await requireCapability(userId, projectId, "payment.delete");
  if (!reason.trim()) throw new DomainError("Deletion reason required", "REASON_REQUIRED");
  const payment = await prisma.paymentRecord.findFirst({ where: { id: paymentId, projectId } });
  if (!payment) throw new NotFoundError();
  await prisma.paymentRecord.update({
    where: { id: paymentId },
    data: { deletedAt: new Date(), deletedBy: userId, deletedReason: reason },
  });
  await writeAuditLog({
    projectId,
    recordType: "PaymentRecord",
    recordId: paymentId,
    action: AUDIT_ACTIONS.PAYMENT_DELETE,
    changedBy: userId,
    oldValue: { amount: payment.amount.toString() },
    newValue: { deleted: true, reason },
  });
  return persistPaymentStatus(payment.saleId);
}

export async function listSales(userId: string, projectId: string) {
  await requireCapability(userId, projectId, "sale.read");
  return prisma.saleAllocation.findMany({
    where: { projectId },
    include: {
      buyer: true,
      unit: true,
      land: true,
      payments: { where: { deletedAt: null }, orderBy: { paymentDate: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listBuyers(userId: string, projectId: string) {
  await requireCapability(userId, projectId, "buyer.write");
  return prisma.buyerContact.findMany({ where: { projectId }, orderBy: { name: "asc" } });
}
