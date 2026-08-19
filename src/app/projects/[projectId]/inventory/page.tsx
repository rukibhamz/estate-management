import { requireUser } from "@/lib/guard";
import { loadProjectAssets } from "@/server/assets";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import {
  actionCreateEstate,
  actionCreateLand,
  actionCreateUnit,
  actionUnitStatus,
} from "@/app/actions";

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ estateId?: string; status?: string; unitRef?: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const filters = await searchParams;
  const { estates, lands, buildings, units } = await loadProjectAssets(user.id, projectId);
  const filtered = units.filter((unit) => {
    if (filters.estateId && unit.estateId !== filters.estateId) return false;
    if (filters.status && unit.status !== filters.status) return false;
    if (filters.unitRef && !unit.unitRef.toLowerCase().includes(filters.unitRef.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <form className="mb-6 grid gap-3 rounded-2xl bg-white p-4 text-ink shadow-card md:grid-cols-4">
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
        <Field label="Status">
          <Select name="status" defaultValue={filters.status}>
            <option value="">All</option>
            {["UNDER_CONSTRUCTION", "AVAILABLE", "RESERVED", "ALLOCATED", "SOLD", "UNDER_MAINTENANCE"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Unit ref">
          <Input name="unitRef" defaultValue={filters.unitRef} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardBody>
            <h2 className="mb-4 text-headline-md">Add estate</h2>
            <form action={actionCreateEstate.bind(null, projectId)} className="space-y-3">
              <Field label="Name">
                <Input name="name" required />
              </Field>
              <Field label="Location">
                <Input name="location" />
              </Field>
              <Button type="submit" size="sm">
                Save estate
              </Button>
            </form>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="mb-4 text-headline-md">Add land</h2>
            <form action={actionCreateLand.bind(null, projectId)} className="space-y-3">
              <Field label="Estate">
                <Select name="estateId">
                  <option value="">None</option>
                  {estates.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Location">
                <Input name="location" />
              </Field>
              <Field label="Size">
                <Input name="size" />
              </Field>
              <Button type="submit" size="sm">
                Save land
              </Button>
            </form>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="mb-4 text-headline-md">Add unit</h2>
            <form action={actionCreateUnit.bind(null, projectId)} className="space-y-3">
              <Field label="Unit ref">
                <Input name="unitRef" required />
              </Field>
              <Field label="Type">
                <Input name="type" placeholder="3-bed" />
              </Field>
              <Field label="Estate">
                <Select name="estateId">
                  <option value="">None</option>
                  {estates.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Building (optional)">
                <Select name="buildingId">
                  <option value="">None</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit" size="sm">
                Save unit
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:hidden">
        {filtered.map((unit) => (
          <Card key={unit.id}>
            <CardBody>
              <div className="flex justify-between">
                <p className="font-mono text-mono-data">{unit.unitRef}</p>
                <Badge status={unit.status} />
              </div>
              <p className="mt-2 text-body-md text-ink-muted">{unit.estate?.name ?? "No estate"}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-8 hidden overflow-x-auto rounded-2xl bg-white text-ink shadow-card md:block">
        <table className="w-full text-left text-body-md text-ink">
          <thead className="border-b border-outline-subtle/70 text-label-sm uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Estate</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((unit) => (
              <tr key={unit.id} className="border-b border-outline-subtle/50 last:border-0">
                <td className="px-4 py-3 font-mono text-mono-data">{unit.unitRef}</td>
                <td className="px-4 py-3">{unit.estate?.name ?? "—"}</td>
                <td className="px-4 py-3">{unit.type ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge status={unit.status} />
                </td>
                <td className="px-4 py-3">
                  <form action={actionUnitStatus.bind(null, projectId, unit.id)} className="flex gap-2">
                    <Select name="status" defaultValue={unit.status} className="w-auto">
                      {["UNDER_CONSTRUCTION", "AVAILABLE", "RESERVED", "ALLOCATED", "SOLD", "UNDER_MAINTENANCE"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                    </Select>
                    <Button size="sm" variant="secondary" type="submit">
                      Save
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-headline-md">Land parcels</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {lands.map((land) => (
            <Card key={land.id}>
              <CardBody>
                <div className="flex justify-between">
                  <p>{land.location ?? land.id.slice(0, 8)}</p>
                  <Badge status={land.status} />
                </div>
                <p className="mt-1 text-body-md text-ink-muted">{land.estate?.name ?? "Unassigned"}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
