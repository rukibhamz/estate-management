import { requireUser } from "@/lib/guard";
import { getDashboard } from "@/server/dashboard";
import { KpiCard } from "@/components/ui/StatCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CostDonut, SalesBarChart } from "@/components/dashboard/Charts";
import { formatNairaCompact } from "@/core/money";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AlertTriangle, Droplets, Zap, Wind } from "lucide-react";

const ATTENTION_ICONS = [Droplets, Zap, Wind, AlertTriangle];

export default async function ProjectDashboard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();
  const dash = await getDashboard(user.id, projectId);
  const attention = dash.overdueMilestones.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard
          label="Total Property"
          value={String(dash.totals.properties)}
          hint={`${dash.totals.units} units · ${dash.totals.lands} land`}
          icon="property"
        />
        <KpiCard
          label="Number of Sales"
          value={String(dash.salesSummary.count)}
          hint={`${dash.salesSummary.partPayment} part · ${dash.salesSummary.fullPayment} full`}
          icon="sales"
        />
        <KpiCard
          label="Total Sales"
          value={dash.salesSummary.agreed}
          money
          hint={`Collected ${formatNairaCompact(dash.salesSummary.paid)}`}
          icon="value"
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        <Card className="overflow-visible xl:col-span-3">
          <CardBody className="overflow-visible">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-md text-ink">Report Sales</h2>
              <span className="rounded-full bg-surface-low px-3 py-1 text-label-sm text-ink-muted">Weekday</span>
            </div>
            <SalesBarChart series={dash.weeklySales} />
          </CardBody>
        </Card>
        <Card className="xl:col-span-2">
          <CardBody>
            <h2 className="mb-4 text-headline-md text-ink">Cost Breakdown</h2>
            <CostDonut slices={dash.costBreakdown} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-3 text-headline-md text-ink">Last Transactions</h2>
            {dash.recentPayments.length === 0 ? (
              <p className="text-body-md text-ink-muted">No payments recorded yet.</p>
            ) : (
              <ul className="divide-y divide-outline-subtle/60">
                {dash.recentPayments.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-soft text-label-sm font-semibold text-forest-ink">
                        {row.label.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-body-lg text-ink">{row.label}</p>
                        <p className="mt-0.5 text-label-sm text-ink-muted">
                          {row.dateLabel}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-forest-ink">{formatNairaCompact(row.amount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="mb-3 text-headline-md text-ink">Attention</h2>
            {attention.length === 0 ? (
              <div className="space-y-2">
                {dash.developments.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-2xl bg-surface-low px-3 py-2.5">
                    <div>
                      <p className="text-body-lg">{d.name}</p>
                      <p className="mt-0.5 text-label-sm text-ink-muted">{d.progressPct}% complete</p>
                    </div>
                    <Badge status={d.status} />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {attention.map((item, index) => {
                  const Icon = ATTENTION_ICONS[index % ATTENTION_ICONS.length];
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-0.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-low text-forest-ink">
                          <Icon size={16} className="stroke-current" />
                        </span>
                        <div>
                          <p className="text-body-lg">{item.description}</p>
                          <p className="mt-0.5 font-mono text-mono-data text-ink-muted">Overdue milestone</p>
                        </div>
                      </div>
                      <Badge status="OVERDUE" />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
