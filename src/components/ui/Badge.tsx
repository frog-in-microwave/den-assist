import type { ReactNode } from "react";

export function ActiveBadge({ label = "Active", active = true }: { label?: string; active?: boolean }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-sunken)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-ink-faint)] border border-[var(--color-border)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink-faint)]" />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}

export function StatusBadge({ children, variant = "neutral" }: { children: ReactNode; variant?: "neutral" | "success" | "warning" | "brand" }) {
  const styles = {
    neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] border-[var(--color-border)]",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    brand: "bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)] border-[var(--color-brand-soft)]",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
