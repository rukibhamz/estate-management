import { requireUser } from "@/lib/guard";
import { getSalesReport } from "@/server/dashboard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { formatNaira } from "@/core/money";

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ estateId?: string; paymentStatus?: string; assetType?: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const filters = await searchParams;
  const [rows, estates] = await Promise.all([
    getSalesReport(user.id, projectId, filters),
    prisma.estate.findMany({ where: { projectId } }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Analytics" title="Reports" description="Filter sales by estate, asset type, and payment status." />
      <form className="mb-6 grid gap-3 rounded border border-outline-subtle bg-white p-4 md:grid-cols-4">
        <Field label="Estate">
          <Select name="estateId" defaultValue={filters.estateId}>
            <option value="">All</option>
            {estates.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Payment">
          <Select name="paymentStatus" defaultValue={filters.paymentStatus}>
            <option value="">All</option>
            {["NOT_APPLICABLE", "PART_PAYMENT", "FULL_PAYMENT"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Asset">
          <Select name="assetType" defaultValue={filters.assetType}>
            <option value="">All</option>
            <option>UNIT</option>
            <option>LAND</option>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </div>
      </form>
      <Card>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full text-left text-body-md">
            <thead className="border-b border-outline-subtle text-label-sm uppercase text-ink-muted">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-outline-subtle last:border-0">
                  <td className="px-4 py-3 font-mono text-mono-data">
                    {row.unit?.unitRef ?? row.land?.location ?? "—"}
                  </td>
                  <td className="px-4 py-3">{row.buyer?.name ?? "—"}</td>
                  <td className="px-4 py-3">{formatNaira(row.agreedValue.toString())}</td>
                  <td className="px-4 py-3">{formatNaira(row.totalPaid.toString())}</td>
                  <td className="px-4 py-3">
                    <Badge status={row.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}
