import Link from "next/link";

import { LogOut } from "lucide-react";

import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui";
import { logoutAction } from "@/app/actions/auth";
import { hasAuthEnabled } from "@/lib/env";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const authEnabled = hasAuthEnabled();

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

          <div className="flex items-center gap-1">
            <AppNav />
            {authEnabled ? (
              <form action={logoutAction} className="ml-1">
                <Button type="submit" variant="ghost" className="h-9 px-3">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">退出</span>
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
