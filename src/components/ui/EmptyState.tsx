import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      {icon && (
        <div className="mb-4 h-12 w-12 rounded-full bg-[var(--color-surface-sunken)] grid place-items-center text-[var(--color-ink-faint)]">
          {icon}
        </div>
      )}
      <h3 className="font-[family-name:var(--font-display)] text-[18px] text-[var(--color-ink)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-[14px] text-[var(--color-ink-faint)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
