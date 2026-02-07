import { z } from "zod";
import { getEnv } from "@/lib/env";

const ProbeNodeSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  cpu_name: z.string().catch(""),
  cpu_cores: z.number().int().catch(0),
  os: z.string().catch(""),
  arch: z.string().catch(""),
  region: z.string().catch(""),
  mem_total: z.number().int().catch(0),
  disk_total: z.number().int().catch(0),
  price: z.number().catch(0),
  billing_cycle: z.number().catch(0),
  currency: z.string().catch(""),
  expired_at: z.string().catch(""),
  group: z.string().catch(""),
  tags: z.string().catch(""),
});

export type ProbeNode = z.infer<typeof ProbeNodeSchema>;

const ProbeResponseSchema = z.object({
  status: z.string(),
  data: z.array(ProbeNodeSchema).catch([]),
});

export async function fetchProbeNodes(): Promise<ProbeNode[]> {
  const env = getEnv();
  if (!env.PROBE_API_URL) throw new Error("PROBE_API_URL 未配置。");

  const res = await fetch(env.PROBE_API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Probe API 错误: ${res.status}`);

  const json = await res.json();
  const parsed = ProbeResponseSchema.parse(json);
  return parsed.data;
}
