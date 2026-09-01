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
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l1.293 1.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: "/patients",
    label: "Patients",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    href: "/treatments",
    label: "Treatments",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

function isActive(current: string, href: string) {
  if (href === "/") return current === "/";
  return current.startsWith(href);
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
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
          <Logomark className="w-8 h-8" />
          <span className="font-[family-name:var(--font-display)] text-[20px] font-bold tracking-tight text-slate-900">
            Den-Assist
          </span>
        </div>

        <nav className="flex-1 px-3.5 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] transition-all ${
                  active
                    ? "bg-sky-50 text-sky-700 font-semibold shadow-sm shadow-sky-500/10 border border-sky-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Action at bottom */}
        <div className="p-3.5 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7.5 17.5H4.167a1.667 1.667 0 01-1.667-1.667V4.167A1.667 1.667 0 014.167 2.5H7.5M13.333 14.167L17.5 10l-4.167-4.167M17.5 10H7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile / tablet: condensed top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14">
          <Logomark className="w-7 h-7" />
          <span className="font-[family-name:var(--font-display)] text-[18px] font-bold text-slate-900">
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
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] ${
                  active
                    ? "bg-sky-50 text-sky-700 font-semibold border border-sky-200"
                    : "text-slate-600 hover:bg-slate-100"
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

function Logomark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 text-white shadow-md shadow-sky-500/20 p-1.5 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" fill="white" fillOpacity="0.25" />
        <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
      </svg>
    </div>
  );
}
