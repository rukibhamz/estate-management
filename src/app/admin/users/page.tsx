import { requireUser } from "@/lib/guard";
import { listPlatformUsers } from "@/server/platform";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { actionSetPlatformAdmin } from "@/app/actions";
import { formatLagosDateTime } from "@/core/datetime";
import { labelize } from "@/lib/cn";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const rows = await listPlatformUsers(user.id, q);

  return (
    <div className="space-y-4">
      <form className="surface-glass grid gap-3 rounded-2xl p-4 shadow-card md:grid-cols-[1fr_auto]">
        <Field label="Search">
          <Input name="q" defaultValue={q} placeholder="Name or email" />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </div>
      </form>
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardBody className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-body-lg text-ink">{row.name}</p>
                <p className="font-mono text-mono-data text-ink-muted">{row.email}</p>
                <p className="mt-1 text-label-sm text-ink-muted">
                  Joined {formatLagosDateTime(row.createdAt)} · {row._count.ownedProjects} projects ·{" "}
                  {row._count.memberships} memberships
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {row.isPlatformAdmin ? <Badge status="PLATFORM_ADMIN" /> : null}
                <Badge status={row.subscription?.status ?? "TRIALING"} />
                <span className="text-label-sm text-ink-muted">
                  {labelize(row.subscription?.plan ?? "TRIAL")}
                </span>
                {row.id === user.id ? (
                  <p className="text-label-sm text-ink-muted">You</p>
                ) : (
                  <form action={actionSetPlatformAdmin.bind(null, row.id)}>
                    <input type="hidden" name="next" value={row.isPlatformAdmin ? "0" : "1"} />
                    <Button size="sm" variant={row.isPlatformAdmin ? "danger" : "secondary"} type="submit">
                      {row.isPlatformAdmin ? "Revoke admin" : "Make super admin"}
                    </Button>
                  </form>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
