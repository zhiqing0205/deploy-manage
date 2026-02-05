import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-zinc-200/70 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:shadow-md supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/70 dark:bg-zinc-950/40 dark:supports-[backdrop-filter]:bg-zinc-950/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: "zinc" | "green" | "amber" | "red" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : tone === "amber"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : tone === "red"
          ? "bg-red-500/10 text-red-700 dark:text-red-300"
          : tone === "blue"
            ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
            : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function Hr() {
  return <hr className="my-4 border-zinc-200 dark:border-zinc-800" />;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-zinc-200/60 dark:bg-zinc-800/50", className)}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white",
        className,
      )}
      aria-label="loading"
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {label}
        </label>
        {hint ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-white/10",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-white/10",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-white/10",
        props.className,
      )}
    />
  );
}

export function Button({
  tone = "zinc",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "zinc" | "blue" | "red";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/30"
      : tone === "red"
        ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/30"
        : "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-500/30 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:focus-visible:ring-white/20";

  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        toneClass,
        props.className,
      )}
    />
  );
}

export function ButtonLink({
  children,
  href,
  tone = "zinc",
  target,
  rel,
}: {
  children: ReactNode;
  href: string;
  tone?: "zinc" | "blue";
  target?: string;
  rel?: string;
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/30"
      : "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-500/30 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:focus-visible:ring-white/20";

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
        toneClass,
      )}
    >
      {children}
    </a>
  );
}

export function SubtleLink({
  children,
  href,
  target,
  rel,
}: {
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="text-sm text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
}
