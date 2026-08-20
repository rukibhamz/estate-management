import { requireUser } from "@/lib/guard";
import { getPrimaryOrganization } from "@/server/organizations";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import {
  actionInviteOrganizationMember,
  actionChangeOrganizationMemberRole,
  actionRemoveOrganizationMember,
} from "@/app/actions";
import { TENANT_ROLES, TENANT_ROLE_LABELS, tenantRoleCanInvite } from "@/core/tenant";
import { labelize } from "@/lib/cn";

export default async function OrganizationTeamPage() {
  const user = await requireUser();
  const org = await getPrimaryOrganization(user.id);
  if (!org) {
    return (
      <Card>
        <CardBody>
          <p className="text-body-lg text-ink-muted">You are not part of an organization yet.</p>
        </CardBody>
      </Card>
    );
  }

  const myMembership = org.members.find((m) => m.user.id === user.id);
  const canInvite = myMembership ? tenantRoleCanInvite(myMembership.role) : false;

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-headline-md text-ink">{org.name}</h2>
            <p className="text-body-md text-ink-muted">
              {labelize(org.type)} workspace · {org._count.members} of {org.subscription?.seats ?? 1} seats used
            </p>
          </div>
          {org.subscription ? (
            <div className="flex items-center gap-2">
              <Badge status={org.subscription.status} />
              <span className="text-label-sm text-ink-muted">{labelize(org.subscription.plan)}</span>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {canInvite ? (
        <Card>
          <CardBody>
            <h2 className="mb-4 text-headline-md text-ink">Invite teammate</h2>
            <form action={actionInviteOrganizationMember.bind(null, org.id)} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <Field label="Email">
                <Input name="email" type="email" required placeholder="colleague@company.com" />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue="MEMBER">
                  {TENANT_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {TENANT_ROLE_LABELS[role]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Button type="submit">Send invite</Button>
              </div>
            </form>
            <p className="mt-3 text-body-md text-ink-muted">
              Invited users share your organization license and only see projects in this workspace.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <div className="space-y-3">
        {org.members.map((member) => (
          <Card key={member.id}>
            <CardBody className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-body-lg text-ink">{member.user.name}</p>
                <p className="font-mono text-mono-data text-ink-muted">{member.user.email}</p>
              </div>
              {canInvite && member.user.id !== user.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <form action={actionChangeOrganizationMemberRole.bind(null, org.id, member.id)} className="flex items-center gap-2">
                    <Select name="role" defaultValue={member.role} className="min-w-[140px]">
                      {TENANT_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {TENANT_ROLE_LABELS[role]}
                        </option>
                      ))}
                    </Select>
                    <Button size="sm" variant="secondary" type="submit">
                      Update
                    </Button>
                  </form>
                  <form action={actionRemoveOrganizationMember.bind(null, org.id, member.id)}>
                    <Button size="sm" variant="danger" type="submit">
                      Remove
                    </Button>
                  </form>
                </div>
              ) : (
                <span className="rounded-full bg-forest-soft px-3 py-1 text-label-sm text-forest-ink">
                  {TENANT_ROLE_LABELS[member.role]}
                </span>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
