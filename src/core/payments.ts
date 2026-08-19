import { addMoney, moneyCmp, moneyString, subMoney } from "./money";
import { DomainError } from "./errors";

export type PaymentStatus = "NOT_APPLICABLE" | "PART_PAYMENT" | "FULL_PAYMENT";

export function recalculatePaymentStatus(input: {
  agreedValue: string | number;
  amounts: Array<string | number>;
}) {
  const agreed = moneyString(input.agreedValue);
  const totalPaid = addMoney(input.amounts);
  const isOverpaid = moneyCmp(totalPaid, agreed) > 0;
  const rawOutstanding = subMoney(agreed, totalPaid);
  const outstanding = moneyCmp(rawOutstanding, 0) < 0 ? "0.00" : rawOutstanding;

  let paymentStatus: PaymentStatus = "NOT_APPLICABLE";
  if (moneyCmp(totalPaid, 0) > 0 && moneyCmp(totalPaid, agreed) < 0) {
    paymentStatus = "PART_PAYMENT";
  } else if (moneyCmp(totalPaid, 0) > 0 && moneyCmp(totalPaid, agreed) >= 0) {
    paymentStatus = "FULL_PAYMENT";
  }

  return {
    totalPaid,
    outstanding,
    isOverpaid,
    paymentStatus,
  };
}

export function assertRefundNote(amount: string | number, note?: string | null) {
  if (moneyCmp(amount, 0) < 0 && !note?.trim()) {
    throw new DomainError("Refunds require a note", "REFUND_NOTE_REQUIRED");
  }
}

export function canEditPayment(input: {
  actorId: string;
  recordedBy: string;
  editableUntil: Date;
  now: Date;
  canEditAny: boolean;
}) {
  if (input.canEditAny) return true;
  return input.actorId === input.recordedBy && input.now.getTime() < input.editableUntil.getTime();
}

export function paymentEditWindowHours() {
  const raw = process.env.PAYMENT_EDIT_WINDOW_HOURS ?? "24";
  return Number(raw) || 24;
}
