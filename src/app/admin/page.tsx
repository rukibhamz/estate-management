import Link from "next/link";
import { requireUser } from "@/lib/guard";
import { getPlatformOverview } from "@/server/platform";
import { KpiCard } from "@/components/ui/StatCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatLagosDateTime } from "@/core/datetime";
import { labelize } from "@/lib/cn";

export default async function AdminHomePage() {
  const user = await requireUser();
  const overview = await getPlatformOverview(user.id);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Users" value={String(overview.users)} hint="Registered accounts" icon="property" />
        <KpiCard label="Organizations" value={String(overview.organizations)} hint="Tenants" icon="value" />
        <KpiCard label="Projects" value={String(overview.projects)} hint="Across all tenants" icon="sales" />
        <KpiCard label="Active plans" value={String(overview.activeSubs)} hint="Paying or assigned" icon="sales" />
        <KpiCard label="Trials" value={String(overview.trialSubs)} hint="Trialing seats" icon="property" />
        <KpiCard label="Canceled" value={String(overview.canceled)} hint="Ended plans" icon="sales" />
      </div>
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-headline-md text-ink">Recent organizations</h2>
            <Link href="/admin/organizations" className="text-body-md font-medium text-forest-ink hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-outline-subtle/60">
            {overview.latestOrgs.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-body-lg text-ink">{row.name}</p>
                  <p className="text-label-sm text-ink-muted">
                    {row._count.members} members · {row._count.projects} projects · {labelize(row.type)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={row.subscription?.status ?? "TRIALING"} />
                  <p className="text-label-sm text-ink-muted">
                    {row.members[0]?.user.name ?? "—"} · {formatLagosDateTime(row.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
