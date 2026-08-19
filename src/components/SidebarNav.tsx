"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
  LogOut,
  FolderKanban,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { BrandMark } from "./BrandMark";

const PROJECT_NAV = [
  { href: (id: string) => `/projects/${id}/inventory`, label: "Inventory", icon: Landmark, match: "prefix" as const },
  { href: (id: string) => `/projects/${id}/developments`, label: "Developments", icon: Building2, match: "prefix" as const },
  { href: (id: string) => `/projects/${id}/sales`, label: "Sales", icon: Handshake, match: "prefix" as const },
  { href: (id: string) => `/projects/${id}/reports`, label: "Reports", icon: BarChart3, match: "prefix" as const },
  { href: (id: string) => `/projects/${id}/documents`, label: "Documents", icon: FileText, match: "prefix" as const },
  { href: (id: string) => `/projects/${id}/team`, label: "Team", icon: Users, match: "prefix" as const },
  { href: (id: string) => `/projects/${id}/audit`, label: "Audit", icon: ScrollText, match: "prefix" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  href,
  label,
  active,
  collapsed,
  icon: Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  icon: typeof LayoutDashboard;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "flex items-center rounded-2xl text-body-md font-medium transition-colors",
        collapsed ? "h-12 w-12 justify-center" : "h-11 w-full gap-3 px-3.5",
        active ? "bg-[#1F6B4A] text-white shadow-sm" : "text-ink-muted hover:bg-[#EAF4EE] hover:text-[#163D2C]",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}

export function SidebarNav({
  projectId,
  projectName,
  userName,
  collapsed,
  onToggle,
}: {
  projectId?: string;
  projectName?: string;
  userName: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <aside
      className={cn(
        "fixed bottom-3 left-3 top-3 z-30 hidden flex-col overflow-hidden rounded-[28px] bg-white py-5 shadow-card transition-[width] duration-200 md:flex",
        collapsed ? "w-[76px] items-center px-2" : "w-[252px] px-3.5",
      )}
    >
      <div className={cn("mb-4 flex shrink-0 items-center", collapsed ? "flex-col gap-2" : "gap-2 px-1")}>
        <Link href="/projects" className="flex min-w-0 flex-1 items-center gap-2 text-forest" title="EstateFlow">
          <BrandMark className="h-8 w-8 shrink-0" />
          {!collapsed ? <span className="truncate text-[18px] font-semibold text-ink">EstateFlow</span> : null}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-forest-soft hover:text-forest"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {!collapsed && projectName ? (
        <p className="mb-4 truncate px-3.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          {projectName}
        </p>
      ) : null}

      <nav className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1", collapsed && "items-center")}>
        <NavItem
          href="/projects"
          label="Projects"
          icon={FolderKanban}
          collapsed={collapsed}
          active={pathname === "/projects" || pathname === "/projects/new"}
        />
        {projectId ? (
          <NavItem
            href={`/projects/${projectId}`}
            label="Dashboard"
            icon={LayoutDashboard}
            collapsed={collapsed}
            active={pathname === `/projects/${projectId}` || pathname === `/projects/${projectId}/`}
          />
        ) : null}
        {projectId
          ? PROJECT_NAV.map((item) => {
              const href = item.href(projectId);
              return (
                <NavItem
                  key={item.label}
                  href={href}
                  label={item.label}
                  icon={item.icon}
                  collapsed={collapsed}
                  active={isActive(pathname, href, item.match)}
                />
              );
            })
          : null}
      </nav>

      <div className={cn("mt-4 flex shrink-0 flex-col gap-2 border-t border-outline-subtle/80 pt-4", collapsed && "items-center")}>
        {projectId ? (
          <NavItem
            href={`/projects/${projectId}/alerts`}
            label="Alerts"
            icon={Bell}
            collapsed={collapsed}
            active={pathname.includes("/alerts")}
          />
        ) : null}
        <button
          type="button"
          title="Sign out"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center rounded-2xl text-body-md font-medium text-ink-muted hover:bg-forest-soft hover:text-forest",
            collapsed ? "h-12 w-12 justify-center" : "h-11 w-full gap-3 px-3.5",
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed ? <span>Sign out</span> : null}
        </button>
        <Link
          href="/profile"
          title={userName}
          className={cn("mt-2 flex items-center", collapsed ? "justify-center" : "gap-3 px-2")}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F6B4A] text-label-sm text-white">
            {initials || "U"}
          </span>
          {!collapsed ? (
            <span className="truncate text-body-md font-medium text-ink">{userName}</span>
          ) : null}
        </Link>
      </div>
    </aside>
  );
}
