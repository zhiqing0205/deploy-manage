"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "up" | "down" | "unknown";

const statusConfig: Record<Status, { label: string; className: string }> = {
  loading: {
    label: "检测中",
    className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
  up: {
    label: "正常",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  down: {
    label: "异常",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  unknown: {
    label: "未知",
    className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

export function HealthBadge({ url }: { url: string }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function check() {
      try {
        const res = await fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal,
        });
        // In no-cors mode, opaque response has status 0 which means it went through
        setStatus(res.ok || res.status === 0 || res.type === "opaque" ? "up" : "down");
      } catch {
        if (!controller.signal.aborted) {
          setStatus("down");
        }
      }
    }

    check();

    return () => controller.abort();
  }, [url]);

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "up"
            ? "bg-emerald-500"
            : status === "down"
              ? "bg-red-500"
              : "bg-zinc-400"
        }`}
      />
      {config.label}
    </span>
  );
}
