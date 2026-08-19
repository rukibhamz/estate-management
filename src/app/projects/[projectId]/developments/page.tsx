import { requireUser } from "@/lib/guard";
import { listDevelopments, varianceFor } from "@/server/developments";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import {
  actionAddPhase,
  actionAddSpend,
  actionApprove,
  actionCreateDevelopment,
  actionPhaseProgress,
  actionPropose,
} from "@/app/actions";

export default async function DevelopmentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const [items, estates, lands] = await Promise.all([
    listDevelopments(user.id, projectId),
    prisma.estate.findMany({ where: { projectId } }),
    prisma.land.findMany({ where: { projectId } }),
  ]);

  return (
    <>
      <Card className="mb-8">
        <CardBody>
          <h2 className="mb-4 text-headline-md">New development</h2>
          <form action={actionCreateDevelopment.bind(null, projectId)} className="grid gap-3 md:grid-cols-2">
            <Field label="Name">
              <Input name="name" required />
            </Field>
            <Field label="Estate">
              <Select name="estateId">
                <option value="">Optional</option>
                {estates.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Planned units">
              <Input name="plannedUnitCount" type="number" min={1} />
            </Field>
            <Field label="Approved budget (₦)">
              <Input name="approvedBudget" />
            </Field>
            <Field label="Land parcels">
              <select name="landIds" multiple className="field-control h-24 w-full rounded-2xl p-3 text-body-md outline-none focus:ring-2 focus:ring-forest/25">
                {lands.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.location ?? l.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <div className="md:col-span-2">
              <Button type="submit">Create development</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-6">
        {items.map((dev) => {
          const variance = varianceFor(dev);
          return (
            <Card key={dev.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-headline-md text-ink">{dev.name}</h2>
                    <p className="text-body-md text-ink-muted">
                      {dev.progressPct}% · {dev._count.units} units · lands {dev.lands.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={dev.status} />
                    {variance.overall.isOverrun ? <Badge status="OVERDUE" /> : null}
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-gray">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${dev.progressPct}%` }} />
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <form action={actionAddPhase.bind(null, projectId, dev.id)} className="space-y-2">
                    <p className="text-label-sm uppercase text-ink-muted">Add phase</p>
                    <Input name="name" placeholder="Phase name" required />
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="weight" placeholder="Weight" type="number" />
                      <Input name="budget" placeholder="Budget" />
                    </div>
                    <Button size="sm" type="submit">
                      Add phase
                    </Button>
                  </form>
                  <form action={actionAddSpend.bind(null, projectId)} className="space-y-2">
                    <p className="text-label-sm uppercase text-ink-muted">Log spend</p>
                    <input type="hidden" name="developmentId" value={dev.id} />
                    <Input name="amount" placeholder="Amount" required />
                    <Input name="date" type="date" required />
                    <Button size="sm" type="submit">
                      Log spend
                    </Button>
                  </form>
                </div>
                <ul className="mt-4 space-y-3">
                  {dev.phases.map((phase) => (
                    <li key={phase.id} className="rounded-2xl bg-surface-low p-3">
                      <div className="flex justify-between">
                        <span>{phase.name}</span>
                        <span className="font-mono text-mono-data">{phase.progressPct}%</span>
                      </div>
                      <form action={actionPhaseProgress.bind(null, projectId, phase.id)} className="mt-2 flex gap-2">
                        <Input name="progressPct" type="number" min={0} max={100} defaultValue={phase.progressPct} />
                        <Button size="sm" variant="secondary" type="submit">
                          Update
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-2">
                  <form action={actionPropose.bind(null, projectId, dev.id)}>
                    <Button variant="secondary" type="submit">
                      Propose complete
                    </Button>
                  </form>
                  <form action={actionApprove.bind(null, projectId, dev.id)}>
                    <Button type="submit">Approve & generate units</Button>
                  </form>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
