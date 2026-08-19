import Link from "next/link";
import { authSession } from "@/lib/guard";
import { redirect } from "next/navigation";
import { BrandLogo, BrandName } from "@/components/BrandLogo";
import { BrandMark } from "@/components/BrandMark";
import { LaptopMockup } from "@/components/landing/LaptopMockup";

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#inventory", label: "Inventory" },
  { href: "#payments", label: "Payments" },
];

export default async function HomePage() {
  const session = await authSession();
  if (session?.user) redirect("/projects");

  return (
    <div className="min-h-screen text-ink">
      <header className="sticky top-0 z-40 bg-app">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 pb-5 pt-8 lg:px-10">
          <Link href="/" className="justify-self-start text-forest-ink">
            <BrandLogo markClassName="h-8 w-8" />
          </Link>
          <nav className="surface-glass hidden items-center gap-2 rounded-full p-1.5 shadow-card md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-5 py-2 text-body-md text-ink-muted transition hover:bg-forest-soft hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/register"
              className="rounded-full bg-forest px-5 py-2 text-body-md font-medium text-white"
            >
              Get started
            </Link>
          </nav>
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/login"
              className="surface-glass rounded-full px-5 py-2 text-body-md font-medium text-ink shadow-card hover:bg-forest-soft"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-forest px-4 py-2 text-body-md font-medium text-white md:hidden"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="product" className="px-6 pb-8 pt-10 lg:px-10 lg:pb-14 lg:pt-16">
          <LaptopMockup />
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-20 lg:px-10 lg:py-28">
          <div>
            <blockquote className="max-w-3xl text-[34px] font-light leading-[1.15] tracking-tight text-ink sm:text-[44px] lg:text-[52px]">
              “Spreadsheets and chat threads leave allocations{" "}
              <span className="font-semibold">disjointed</span>. That{" "}
              <span className="font-semibold">slows us down</span>.”
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-label-sm font-semibold text-white">
                AO
              </span>
              <div>
                <p className="text-body-md font-medium text-ink">Ada Owner</p>
                <p className="text-label-sm text-ink-muted">Director, Lekki Waterside</p>
              </div>
            </div>
          </div>
          <p
            id="inventory"
            className="max-w-md justify-self-end text-right text-[17px] leading-7 text-ink-muted lg:pb-2"
          >
            <BrandName /> centralizes land, units, construction progress, and ₦ collections in one
            project-scoped workspace — with an audit trail your team can trust.
          </p>
        </section>

        <section id="payments" className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-3">
            <div className="flex justify-between gap-10 lg:justify-start lg:gap-16">
              <Meta label="Project" value="EstateFlow" />
              <Meta label="Industry" value="Real estate" />
            </div>
            <div className="flex justify-center">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-forest text-white shadow-[0_0_48px_rgba(31,107,74,0.4)]">
                <BrandMark className="h-9 w-9" />
              </span>
            </div>
            <div className="flex justify-between gap-10 lg:justify-end lg:gap-16">
              <Meta label="Location" value="Lagos, Nigeria" />
              <Meta label="Year" value="2026" />
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10 text-body-md text-ink-muted lg:px-10">
        <p>© {new Date().getFullYear()} EstateFlow</p>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-ink">
            Create account
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-label-sm uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <p className="mt-1 text-headline-md text-ink">{value}</p>
    </div>
  );
}
