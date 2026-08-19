import { requireUser } from "@/lib/guard";
import { getDashboard } from "@/server/dashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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

  return (
    <>
      <PageHeader
        eyebrow={project.location ?? "Project"}
        title={project.name}
        description={project.description ?? "Asset counts, construction progress, and collections."}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total sales value" value={dash.salesSummary.agreed} money hint={`${dash.salesSummary.count} active allocations`} />
        <StatCard label="Collected" value={dash.salesSummary.paid} money hint={`${dash.salesSummary.fullPayment} full · ${dash.salesSummary.partPayment} part`} />
        <StatCard label="Outstanding" value={dash.salesSummary.outstanding} money hint={dash.salesSummary.overpaid ? `${dash.salesSummary.overpaid} overpaid` : "No overpayments"} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="text-headline-md text-precision">Active developments</h2>
            <div className="mt-4 space-y-4">
              {dash.developments.length === 0 ? (
                <p className="text-body-md text-ink-muted">No in-progress developments.</p>
              ) : (
                dash.developments.map((d) => (
                  <div key={d.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-body-lg">{d.name}</span>
                      <Badge status={d.status} />
                    </div>
                    <div className="h-2 overflow-hidden bg-surface-gray">
                      <div className="h-full bg-success" style={{ width: `${d.progressPct}%` }} />
                    </div>
                    <p className="mt-1 font-mono text-mono-data text-ink-muted">{d.progressPct}% · spend {d.spend}</p>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="text-headline-md text-precision">Inventory</h2>
            <ul className="mt-4 space-y-2 text-body-md">
              {dash.unitCounts.map((row) => (
                <li key={row.status} className="flex justify-between">
                  <span className="text-ink-muted">{row.status}</span>
                  <span className="font-mono text-mono-data">{row._count}</span>
                </li>
              ))}
              {dash.landCounts.map((row) => (
                <li key={`land-${row.status}`} className="flex justify-between">
                  <span className="text-ink-muted">Land · {row.status}</span>
                  <span className="font-mono text-mono-data">{row._count}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-label-sm uppercase text-ink-muted">
              Overdue milestones · {dash.overdueMilestones.length}
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
