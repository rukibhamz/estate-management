import { requireUser } from "@/lib/guard";
import { listPlatformOrganizations } from "@/server/organizations";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { actionSetPlatformAdmin } from "@/app/actions";
import { formatLagosDateTime } from "@/core/datetime";
import { labelize } from "@/lib/cn";
import { TENANT_ROLE_LABELS } from "@/core/tenant";

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const organizations = await listPlatformOrganizations(user.id, q);

  return (
    <div className="space-y-4">
      <form className="surface-glass grid gap-3 rounded-2xl p-4 shadow-card md:grid-cols-[1fr_auto]">
        <Field label="Search">
          <Input name="q" defaultValue={q} placeholder="Organization, name, or email" />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </div>
      </form>
      <div className="space-y-4">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-headline-md text-ink">{org.name}</p>
                  <p className="text-label-sm text-ink-muted">
                    {labelize(org.type)} · {org._count.members} members · {org._count.projects} projects
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {org.subscription ? (
                    <>
                      <Badge status={org.subscription.status} />
                      <span className="text-label-sm text-ink-muted">
                        {labelize(org.subscription.plan)} · {org.subscription.seats} seats
                      </span>
                    </>
                  ) : (
                    <Badge status="TRIALING" />
                  )}
                </div>
              </div>
              <ul className="divide-y divide-outline-subtle/60 rounded-xl border border-outline-subtle/60">
                {org.members.map((member) => (
                  <li
                    key={member.id}
                    className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-body-lg text-ink">{member.user.name}</p>
                      <p className="font-mono text-mono-data text-ink-muted">{member.user.email}</p>
                      <p className="mt-1 text-label-sm text-ink-muted">
                        Joined {formatLagosDateTime(member.user.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-forest-soft px-3 py-1 text-label-sm text-forest-ink">
                        {TENANT_ROLE_LABELS[member.role]}
                      </span>
                      {member.user.isPlatformAdmin ? <Badge status="PLATFORM_ADMIN" /> : null}
                      {member.user.id === user.id ? (
                        <span className="text-label-sm text-ink-muted">You</span>
                      ) : (
                        <form action={actionSetPlatformAdmin.bind(null, member.user.id)}>
                          <input type="hidden" name="next" value={member.user.isPlatformAdmin ? "0" : "1"} />
                          <Button
                            size="sm"
                            variant={member.user.isPlatformAdmin ? "danger" : "secondary"}
                            type="submit"
                          >
                            {member.user.isPlatformAdmin ? "Revoke admin" : "Make super admin"}
                          </Button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
