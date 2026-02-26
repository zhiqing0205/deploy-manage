"use client";

import type { Heartbeat } from "@/lib/api/status";
import { Tooltip } from "@/components/Tooltip";

function formatTime(timeStr: string): string {
  const d = new Date(timeStr.replace(" ", "T") + "Z");
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function HeartbeatDot({ beat }: { beat: Heartbeat }) {
  const isUp = beat.status === 1;
  const color = isUp
    ? "bg-emerald-500 dark:bg-emerald-400"
    : "bg-red-500 dark:bg-red-400";

  const label = isUp
    ? `${formatTime(beat.time)} · ${beat.ping ?? "-"}ms`
    : `${formatTime(beat.time)} · 故障`;

  return (
    <Tooltip content={label}>
      <span
        className={`inline-block h-5 w-1 rounded-full transition-transform hover:scale-y-125 ${color}`}
      />
    </Tooltip>
  );
}

export function HeartbeatBar({ beats }: { beats: Heartbeat[] }) {
  // Take last 40 heartbeats for display
  const display = beats.slice(-40);

  if (display.length === 0) return null;

  const upCount = display.filter((b) => b.status === 1).length;
  const uptimePercent = ((upCount / display.length) * 100).toFixed(1);

  const pings = display
    .map((b) => b.ping)
    .filter((p): p is number => p !== null);
  const avgPing =
    pings.length > 0
      ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length)
      : null;

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-[2px]">
        {display.map((beat, i) => (
          <HeartbeatDot key={i} beat={beat} />
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span
          className={
            upCount === display.length
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }
        >
          {uptimePercent}%
        </span>
        {avgPing !== null ? <span>{avgPing}ms</span> : null}
      </div>
    </div>
  );
}
