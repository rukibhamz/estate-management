import { requireUser } from "@/lib/guard";
import { listSales } from "@/server/sales";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatNairaCompact } from "@/core/money";
import {
  actionCreateBuyer,
  actionCreateSale,
  actionRecordPayment,
  actionTransitionSale,
} from "@/app/actions";

export default async function SalesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const [sales, units, lands, buyers] = await Promise.all([
    listSales(user.id, projectId),
    prisma.unit.findMany({ where: { projectId }, orderBy: { unitRef: "asc" } }),
    prisma.land.findMany({ where: { projectId } }),
    prisma.buyerContact.findMany({ where: { projectId } }),
  ]);

  return (
    <>
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-4 text-headline-md">Buyer</h2>
            <form action={actionCreateBuyer.bind(null, projectId)} className="space-y-3">
              <Field label="Name">
                <Input name="name" required />
              </Field>
              <Field label="Phone">
                <Input name="phone" />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" />
              </Field>
              <Button size="sm" type="submit">
                Save buyer
              </Button>
            </form>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="mb-4 text-headline-md">New allocation</h2>
            <form action={actionCreateSale.bind(null, projectId)} className="space-y-3">
              <Field label="Unit">
                <Select name="unitId">
                  <option value="">—</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitRef}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Or land">
                <Select name="landId">
                  <option value="">—</option>
                  {lands.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.location ?? l.id.slice(0, 8)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Buyer">
                <Select name="buyerId">
                  <option value="">—</option>
                  {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Agreed value (₦)">
                <Input name="agreedValue" required />
              </Field>
              <Button size="sm" type="submit">
                Reserve
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-mono-data text-ink-muted">
                    {sale.unit?.unitRef ?? sale.land?.location ?? sale.id.slice(0, 8)}
                  </p>
                  <p className="text-headline-md text-ink">{formatNairaCompact(sale.agreedValue.toString())}</p>
                  <p className="text-body-md text-ink-muted">
                    Paid {formatNairaCompact(sale.totalPaid.toString())}
                    {sale.isOverpaid ? " · overpaid" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge status={sale.commercialStatus} />
                  <Badge status={sale.paymentStatus} />
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <form action={actionTransitionSale.bind(null, projectId, sale.id)} className="flex flex-wrap gap-2">
                  <Select name="status" defaultValue={sale.commercialStatus} className="w-auto">
                    {["RESERVED", "ALLOCATED", "SOLD", "CANCELLED"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                  <Input name="reason" placeholder="Reason if sold/cancel" className="max-w-xs" />
                  <Button size="sm" variant="secondary" type="submit">
                    Update status
                  </Button>
                </form>
                <form action={actionRecordPayment.bind(null, projectId)} className="flex flex-wrap gap-2">
                  <input type="hidden" name="saleId" value={sale.id} />
                  <Input name="amount" placeholder="Amount (negative = refund)" className="max-w-[10rem]" />
                  <Input name="paymentDate" type="date" required />
                  <Input name="note" placeholder="Note" className="max-w-[10rem]" />
                  <Button size="sm" type="submit">
                    Record
                  </Button>
                </form>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
