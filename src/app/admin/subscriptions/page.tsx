import { requireUser } from "@/lib/guard";
import { listSubscriptions } from "@/server/platform";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { actionUpdateSubscription } from "@/app/actions";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUSES } from "@/core/billing";
import { formatLagosDateTime } from "@/core/datetime";
import { labelize } from "@/lib/cn";

export default async function AdminSubscriptionsPage() {
  const user = await requireUser();
  const rows = await listSubscriptions(user.id);

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-body-lg text-ink-muted">No subscriptions yet.</p>
          </CardBody>
        </Card>
      ) : (
        rows.map((row) => (
          <Card key={row.id}>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-headline-md text-ink">{row.user.name}</p>
                  <p className="font-mono text-mono-data text-ink-muted">{row.user.email}</p>
                  <p className="mt-1 text-label-sm text-ink-muted">
                    Started {formatLagosDateTime(row.startedAt)}
                    {row.currentPeriodEnd ? ` · period ends ${formatLagosDateTime(row.currentPeriodEnd)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={row.status} />
                  <span className="text-label-sm text-ink-muted">{labelize(row.plan)}</span>
                </div>
              </div>
              <form action={actionUpdateSubscription.bind(null, row.userId)} className="grid gap-3 md:grid-cols-4">
                <Field label="Plan">
                  <Select name="plan" defaultValue={row.plan}>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {labelize(plan)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select name="status" defaultValue={row.status}>
                    {SUBSCRIPTION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {labelize(status)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Seats">
                  <Input name="seats" type="number" min={1} defaultValue={row.seats} />
                </Field>
                <div className="flex items-end">
                  <Button type="submit" variant="secondary">
                    Save
                  </Button>
                </div>
                <div className="md:col-span-4">
                  <Field label="Notes">
                    <Input name="notes" defaultValue={row.notes ?? ""} placeholder="Internal note" />
                  </Field>
                </div>
              </form>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
