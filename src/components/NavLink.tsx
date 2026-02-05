"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Tooltip content={label}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
          "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
          isActive
            ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
            : "",
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </Tooltip>
  );
}
