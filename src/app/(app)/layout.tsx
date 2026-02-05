import Link from "next/link";

import { hasBasicAuthEnabled } from "@/lib/env";
import { cn } from "@/components/ui";

const navItems = [
  { href: "/", label: "概览" },
  { href: "/services", label: "应用" },
  { href: "/servers", label: "服务器" },
  { href: "/settings", label: "设置" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const authEnabled = hasBasicAuthEnabled();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-semibold tracking-tight">
              DeployManage
            </Link>
            {authEnabled ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                已启用鉴权
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                未启用鉴权
              </span>
            )}
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
