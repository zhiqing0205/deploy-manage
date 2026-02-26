import { z } from "zod";
import { getEnv } from "@/lib/env";

// --- Schemas ---

const MonitorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: z.string().catch("http"),
  sendUrl: z.number().catch(0),
});

export type StatusMonitor = z.infer<typeof MonitorSchema> & { group: string };

const MonitorGroupSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  weight: z.number().catch(0),
  monitorList: z.array(MonitorSchema).catch([]),
});

const StatusResponseSchema = z.object({
  publicGroupList: z.array(MonitorGroupSchema).catch([]),
});

const HeartbeatSchema = z.object({
  status: z.number().int(),
  time: z.string(),
  msg: z.string().catch(""),
  ping: z.number().nullable().catch(null),
});

export type Heartbeat = z.infer<typeof HeartbeatSchema>;

const HeartbeatResponseSchema = z.object({
  heartbeatList: z.record(z.string(), z.array(HeartbeatSchema).catch([])).catch({}),
});

// --- Helpers ---

function getUptimeUrls(): { statusUrl: string; heartbeatUrl: string } {
  const env = getEnv();
  if (!env.UPTIME_URL || !env.UPTIME_PAGE) {
    throw new Error("UPTIME_URL 和 UPTIME_PAGE 未配置。");
  }
  const base = env.UPTIME_URL.replace(/\/+$/, "");
  const page = env.UPTIME_PAGE;
  return {
    statusUrl: `${base}/api/status-page/${page}`,
    heartbeatUrl: `${base}/api/status-page/heartbeat/${page}`,
  };
}

export function isUptimeConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.UPTIME_URL && env.UPTIME_PAGE);
}

// --- Fetch monitors ---

export async function fetchStatusMonitors(): Promise<StatusMonitor[]> {
  const { statusUrl } = getUptimeUrls();

  const res = await fetch(statusUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Status API 错误: ${res.status}`);

  const json = await res.json();
  const parsed = StatusResponseSchema.parse(json);

  const monitors: StatusMonitor[] = [];
  for (const group of parsed.publicGroupList) {
    for (const m of group.monitorList) {
      monitors.push({ ...m, group: group.name });
    }
  }
  return monitors;
}

// --- Fetch heartbeats ---

export async function fetchHeartbeats(): Promise<Map<number, Heartbeat[]>> {
  const { heartbeatUrl } = getUptimeUrls();

  const res = await fetch(heartbeatUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Heartbeat API 错误: ${res.status}`);

  const json = await res.json();
  const parsed = HeartbeatResponseSchema.parse(json);

  const map = new Map<number, Heartbeat[]>();
  for (const [idStr, beats] of Object.entries(parsed.heartbeatList)) {
    const id = Number(idStr);
    if (!Number.isNaN(id)) {
      map.set(id, beats);
    }
  }
  return map;
}
