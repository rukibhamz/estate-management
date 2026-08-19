import Link from "next/link";
import { authSession } from "@/lib/guard";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export default async function HomePage() {
  const session = await authSession();
  if (session?.user) redirect("/projects");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-container items-center justify-between px-6 py-6">
        <BrandLogo showName className="text-headline-md" markClassName="h-7 w-7" />
        <div className="flex gap-3">
          <Link href="/login" className="rounded-full px-4 py-2 text-body-md text-ink-muted hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-forest px-4 py-2 text-body-md text-white"
          >
            Get started
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-label-sm uppercase tracking-wide text-ink-muted">Project-scoped inventory</p>
        <h1 className="mt-4 text-display-financial text-ink">
          Land, units, and payments with an audit trail.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-ink-muted">
          A modern operations desk for estate developments — inventory, construction progress,
          allocations, and ₦ collections in one tenancy-safe workspace.
        </p>
      </main>
    </div>
  );
}
