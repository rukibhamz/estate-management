import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import {
  LayoutDashboard,
  Landmark,
  Building2,
  Handshake,
  FileText,
  Users,
  ScrollText,
  Bell,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const NAV = [
  { href: (id: string) => `/projects/${id}`, label: "Dashboard", icon: LayoutDashboard },
  { href: (id: string) => `/projects/${id}/inventory`, label: "Inventory", icon: Landmark },
  { href: (id: string) => `/projects/${id}/developments`, label: "Developments", icon: Building2 },
  { href: (id: string) => `/projects/${id}/sales`, label: "Sales", icon: Handshake },
  { href: (id: string) => `/projects/${id}/documents`, label: "Documents", icon: FileText },
  { href: (id: string) => `/projects/${id}/reports`, label: "Reports", icon: BarChart3 },
  { href: (id: string) => `/projects/${id}/team`, label: "Team", icon: Users },
  { href: (id: string) => `/projects/${id}/audit`, label: "Audit", icon: ScrollText },
  { href: (id: string) => `/projects/${id}/alerts`, label: "Alerts", icon: Bell },
];

export function AppShell({
  projectId,
  projectName,
  userName,
  children,
}: {
  projectId?: string;
  projectName?: string;
  userName: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-outline-subtle bg-white md:flex md:flex-col">
        <div className="border-b border-outline-subtle px-5 py-5">
          <Link href="/projects" className="text-headline-md text-precision">
            EstateFlow
          </Link>
          {projectName ? (
            <p className="mt-1 truncate text-body-md text-ink-muted">{projectName}</p>
          ) : null}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <Link
            href="/projects"
            className="block rounded px-3 py-2 text-body-md text-ink-muted hover:bg-surface-low hover:text-ink"
          >
            All projects
          </Link>
          {projectId
            ? NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href(projectId)}
                  className="flex items-center gap-2 rounded px-3 py-2 text-body-md text-ink-muted hover:bg-surface-low hover:text-ink"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))
            : null}
        </nav>
        <div className="border-t border-outline-subtle p-4">
          <p className="mb-2 truncate text-body-md text-ink">{userName}</p>
          <a href="/profile" className="mb-2 block text-body-md text-ink-muted hover:text-ink">
            Profile
          </a>
          <SignOutButton />
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-outline-subtle bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/projects" className="font-semibold text-precision">
            EstateFlow
          </Link>
          <MobileNav projectId={projectId} />
        </header>
        <main className="mx-auto max-w-container px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function MobileNav({ projectId }: { projectId?: string }) {
  return (
    <details className="relative">
      <summary className={cn("list-none cursor-pointer text-body-md text-precision")}>Menu</summary>
      <div className="absolute right-0 mt-2 w-56 rounded border border-outline-subtle bg-white p-2 shadow-modal">
        <Link href="/projects" className="block rounded px-3 py-2 text-body-md">
          Projects
        </Link>
        {projectId
          ? NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href(projectId)}
                className="block rounded px-3 py-2 text-body-md"
              >
                {item.label}
              </Link>
            ))
          : null}
      </div>
    </details>
  );
}
