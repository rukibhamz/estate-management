import Link from "next/link";
import { requireUser } from "@/lib/guard";
import { getPlatformOverview } from "@/server/platform";
import { KpiCard } from "@/components/ui/StatCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatLagosDateTime } from "@/core/datetime";

export default async function AdminHomePage() {
  const user = await requireUser();
  const overview = await getPlatformOverview(user.id);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Signups" value={String(overview.users)} hint="Registered accounts" icon="property" />
        <KpiCard label="Projects" value={String(overview.projects)} hint="Across all accounts" icon="value" />
        <KpiCard label="Active plans" value={String(overview.activeSubs)} hint="Paying or assigned" icon="sales" />
        <KpiCard label="Trials" value={String(overview.trialSubs)} hint="Trialing seats" icon="property" />
        <KpiCard label="Canceled" value={String(overview.canceled)} hint="Ended plans" icon="sales" />
      </div>
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-headline-md text-ink">Recent signups</h2>
            <Link href="/admin/users" className="text-body-md font-medium text-forest-ink hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-outline-subtle/60">
            {overview.latestUsers.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-body-lg text-ink">{row.name}</p>
                  <p className="font-mono text-mono-data text-ink-muted">{row.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {row.isPlatformAdmin ? <Badge status="PLATFORM_ADMIN" /> : null}
                  <Badge status={row.subscription?.status ?? "TRIALING"} />
                  <p className="text-label-sm text-ink-muted">{formatLagosDateTime(row.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
