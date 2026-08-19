"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { BrandLogo } from "./BrandLogo";
import { AlertsBell } from "./AlertsBell";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";
import { projectIdFromPath } from "@/lib/projectPath";
import type { ReactNode } from "react";

const STORAGE_KEY = "estateflow.sidebar.collapsed";
const LAST_PROJECT_KEY = "estateflow.lastProject";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  inventory: { title: "Inventory", subtitle: "Estates, land, buildings, and units." },
  developments: { title: "Developments", subtitle: "Phases, spend, and construction progress." },
  sales: { title: "Sales & payments", subtitle: "Allocations, collections, and refunds." },
  documents: { title: "Documents", subtitle: "Private files with signed downloads." },
  reports: { title: "Reports", subtitle: "Filter sales by estate, type, and payment status." },
  team: { title: "Team", subtitle: "Roles stay inside this project." },
  audit: { title: "Audit history", subtitle: "State changes, scoped to your role." },
  alerts: { title: "Alerts", subtitle: "Overdue work, overruns, and stale progress." },
  new: { title: "New project", subtitle: "You become the Owner/Admin." },
  profile: { title: "Profile", subtitle: "Your name and password." },
  branding: { title: "Branding", subtitle: "Workspace name, logo, favicon, and theme colors." },
};

function headerCopy(pathname: string, firstName: string, projectId?: string, projectName?: string) {
  if (pathname === "/projects" || pathname === "/projects/new") {
    return pathname.endsWith("/new")
      ? PAGE_TITLES.new
      : { title: `Hello, ${firstName}!`, subtitle: "Choose a project to continue." };
  }
  if (projectId && (pathname === `/projects/${projectId}` || pathname === `/projects/${projectId}/`)) {
    return {
      title: `Hello, ${firstName}!`,
      subtitle: projectName
        ? `Explore information and activity about ${projectName}.`
        : "Explore information and activity about your property.",
    };
  }
  const key = pathname.split("/").filter(Boolean).at(-1) ?? "";
  return PAGE_TITLES[key] ?? { title: `Hello, ${firstName}!`, subtitle: "" };
}

const MOBILE_NAV = [
  { href: (id: string) => `/projects/${id}`, label: "Dashboard" },
  { href: (id: string) => `/projects/${id}/inventory`, label: "Inventory" },
  { href: (id: string) => `/projects/${id}/developments`, label: "Developments" },
  { href: (id: string) => `/projects/${id}/sales`, label: "Sales" },
  { href: (id: string) => `/projects/${id}/documents`, label: "Documents" },
  { href: (id: string) => `/projects/${id}/reports`, label: "Reports" },
  { href: (id: string) => `/projects/${id}/team`, label: "Team" },
  { href: (id: string) => `/projects/${id}/audit`, label: "Audit" },
  { href: (id: string) => `/projects/${id}/alerts`, label: "Alerts" },
];

export function AppShell({
  projectId,
  projectName,
  userName,
  isSystemAdmin = false,
  children,
}: {
  projectId?: string;
  projectName?: string;
  userName: string;
  isSystemAdmin?: boolean;
  children: ReactNode;
}) {
  const firstName = userName.split(" ")[0] || userName;
  const pathname = usePathname();
  const pathProjectId = projectIdFromPath(pathname);
  const [savedProject, setSavedProject] = useState<{ id: string; name?: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    const id = projectId ?? pathProjectId;
    if (id) {
      const next = { id, name: projectName };
      try {
        const prev = window.localStorage.getItem(LAST_PROJECT_KEY);
        const parsed = prev ? (JSON.parse(prev) as { id: string; name?: string }) : null;
        const merged = { id, name: projectName ?? parsed?.name };
        window.localStorage.setItem(LAST_PROJECT_KEY, JSON.stringify(merged));
        setSavedProject(merged);
      } catch {
        setSavedProject(next);
      }
      return;
    }
    try {
      const raw = window.localStorage.getItem(LAST_PROJECT_KEY);
      if (raw) setSavedProject(JSON.parse(raw) as { id: string; name?: string });
    } catch {
      setSavedProject(null);
    }
  }, [projectId, pathProjectId, projectName]);

  const resolvedProjectId = projectId ?? pathProjectId ?? savedProject?.id;
  const resolvedProjectName = projectName ?? savedProject?.name;
  const copy = headerCopy(pathname, firstName, resolvedProjectId, resolvedProjectName);

  function toggle() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="min-h-screen text-ink">
      <SidebarNav
        projectId={resolvedProjectId}
        projectName={resolvedProjectName}
        userName={userName}
        isSystemAdmin={isSystemAdmin}
        collapsed={collapsed}
        onToggle={toggle}
      />
      <div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-[148px]" : "md:pl-[292px]")}>
        <header className="sticky top-0 z-20 bg-app px-4 pb-4 pt-6 md:px-6 md:pt-8">
          <div className="mx-auto flex max-w-container flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start justify-between gap-3">
              <Link href="/projects" className="mt-1 text-forest-ink md:hidden">
                <BrandLogo markClassName="h-7 w-7" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-headline-lg text-ink">{copy.title}</h1>
                {copy.subtitle ? <p className="mt-1 text-body-md text-ink-muted">{copy.subtitle}</p> : null}
              </div>
              <MobileNav projectId={resolvedProjectId} isSystemAdmin={isSystemAdmin} />
            </div>
            <div className="flex items-center gap-3">
              <form
                action={resolvedProjectId ? `/projects/${resolvedProjectId}/inventory` : "/projects"}
                className="relative min-w-0 flex-1 lg:w-[340px]"
              >
                <input
                  name="unitRef"
                  placeholder="Search Anything..."
                  className="surface-glass h-12 w-full rounded-full py-2 pl-5 pr-14 text-body-md text-ink shadow-card outline-none placeholder:text-ink-muted"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white"
                  aria-label="Search"
                >
                  <Search size={16} className="stroke-current" />
                </button>
              </form>
              <ThemeToggle />
              {resolvedProjectId ? <AlertsBell projectId={resolvedProjectId} /> : null}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-container px-4 pb-8 sm:px-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

function MobileNav({ projectId, isSystemAdmin }: { projectId?: string; isSystemAdmin: boolean }) {
  return (
    <details className="relative md:hidden">
      <summary className={cn("surface-glass list-none cursor-pointer rounded-full px-4 py-2 text-body-md text-ink shadow-card")}>
        Menu
      </summary>
      <div className="surface-glass absolute right-0 z-30 mt-2 w-56 rounded-2xl p-2 text-ink shadow-modal">
        <Link href="/projects" className="block rounded-xl px-3 py-2 text-body-md text-ink">
          Projects
        </Link>
        {projectId
          ? MOBILE_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href(projectId)}
                className="block rounded-xl px-3 py-2 text-body-md text-ink"
              >
                {item.label}
              </Link>
            ))
          : null}
        {isSystemAdmin ? (
          <Link href="/settings/branding" className="block rounded-xl px-3 py-2 text-body-md text-ink">
            Branding
          </Link>
        ) : null}
      </div>
    </details>
  );
}
