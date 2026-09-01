"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions";

const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor">
        <rect x="2.5" y="2.5" width="6" height="7" rx="1.2" />
        <rect x="11.5" y="2.5" width="6" height="4.5" rx="1.2" />
        <rect x="11.5" y="9.5" width="6" height="8" rx="1.2" />
        <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" />
      </svg>
    ),
  },
  {
    href: "/patients",
    label: "Patients",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor">
        <circle cx="7.5" cy="6.5" r="3" />
        <path d="M2.5 17c0-3 2.2-5 5-5s5 2 5 5" strokeLinecap="round" />
        <circle cx="14.5" cy="7" r="2.2" />
        <path d="M13 12.3c2.4.2 4 1.9 4 4.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/treatments",
    label: "Treatments",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.6" stroke="currentColor">
        <path
          d="M10 2.8c-1.6 0-2.6 1.2-2.6 2.8 0 2.1 1.1 3 1.1 5.6 0 2-.6 3.2-.6 4.4a2.1 2.1 0 0 0 4.2 0c0-1.2-.6-2.4-.6-4.4 0-2.6 1.1-3.5 1.1-5.6 0-1.6-1-2.8-2.6-2.8Z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop: persistent left rail */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-[var(--color-border)]">
          <Logomark />
          <span className="font-[family-name:var(--font-display)] text-[19px] tracking-tight text-[var(--color-ink)]">
            Den Assist
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] transition-colors ${
                  active
                    ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)] font-medium"
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 ${
                    active ? "text-[var(--color-brand)]" : "text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-muted)]"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Action at bottom */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7.5 17.5H4.167a1.667 1.667 0 01-1.667-1.667V4.167A1.667 1.667 0 014.167 2.5H7.5M13.333 14.167L17.5 10l-4.167-4.167M17.5 10H7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>


      {/* Mobile / tablet: condensed top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5 px-4 h-14">
          <Logomark />
          <span className="font-[family-name:var(--font-display)] text-[17px] text-[var(--color-ink)]">
            Den Assist
          </span>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] ${
                  active
                    ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)] font-medium"
                    : "text-[var(--color-ink-muted)]"
                }`}
              >
                <span className="w-4 h-4">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}

function Logomark() {
  // The signature mark: a chart tick borrowed from dental charting notation
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <rect x="1" y="1" width="24" height="24" rx="7" fill="var(--color-brand)" />
      <path
        d="M8 13.2 11.3 16.5 18 9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
