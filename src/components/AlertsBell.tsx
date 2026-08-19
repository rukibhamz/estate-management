"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatLagosDateTime } from "@/core/datetime";
import { labelize } from "@/lib/cn";

type AlertRow = {
  id: string;
  type: string;
  recordType: string;
  recordId: string;
  triggeredAt: string;
};

export function AlertsBell({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AlertRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/alerts`);
      if (!response.ok) return;
      const data = (await response.json()) as { alerts: AlertRow[]; count: number };
      setItems(data.alerts);
      setCount(data.count);
    } catch {
      /* keep last snapshot */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when the project changes
  }, [projectId]);

  useEffect(() => {
    if (!open) return;
    void load();
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-label="Alerts"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="surface-glass relative flex h-12 w-12 items-center justify-center rounded-full text-ink shadow-card"
      >
        <Bell size={18} className="stroke-current" />
        {count > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical-error px-1 text-[10px] font-semibold leading-none text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="surface-glass absolute right-0 z-40 mt-2 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl text-ink shadow-modal">
          <div className="flex items-center justify-between gap-3 border-b border-outline-subtle px-4 py-3">
            <p className="text-body-md font-semibold text-ink">Alerts</p>
            <Link
              href={`/projects/${projectId}/alerts`}
              className="text-label-sm font-medium text-forest-ink hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {loading && items.length === 0 ? (
              <p className="px-3 py-4 text-body-md text-ink-muted">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-4 text-body-md text-ink-muted">No alerts right now.</p>
            ) : (
              items.map((alert) => (
                <Link
                  key={alert.id}
                  href={hrefFor(projectId, alert.recordType)}
                  className="block rounded-xl px-3 py-2.5 hover:bg-forest-soft"
                  onClick={() => setOpen(false)}
                >
                  <p className="text-body-md font-medium text-ink">{labelize(alert.type)}</p>
                  <p className="mt-0.5 font-mono text-mono-data text-ink-muted">
                    {alert.recordType} · {formatLagosDateTime(new Date(alert.triggeredAt))}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function hrefFor(projectId: string, recordType: string) {
  if (recordType === "Milestone" || recordType === "Development") {
    return `/projects/${projectId}/developments`;
  }
  return `/projects/${projectId}/alerts`;
}
