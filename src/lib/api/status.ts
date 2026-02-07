import { z } from "zod";
import { getEnv } from "@/lib/env";

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

export async function fetchStatusMonitors(): Promise<StatusMonitor[]> {
  const env = getEnv();
  if (!env.STATUS_API_URL) throw new Error("STATUS_API_URL 未配置。");

  const res = await fetch(env.STATUS_API_URL, { cache: "no-store" });
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
