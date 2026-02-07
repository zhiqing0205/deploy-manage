import { z } from "zod";
import { getEnv } from "@/lib/env";

const CF_BASE = "https://api.cloudflare.com/client/v4";

function getToken(): string {
  const env = getEnv();
  if (!env.CLOUDFLARE_API_TOKEN) throw new Error("CLOUDFLARE_API_TOKEN 未配置。");
  return env.CLOUDFLARE_API_TOKEN;
}

async function cfFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${CF_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.success) {
    const msg = json.errors?.[0]?.message ?? "Cloudflare API 错误";
    throw new Error(msg);
  }
  return json;
}

// --- Zones ---

const ZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  name_servers: z.array(z.string()).catch([]),
});

export type Zone = z.infer<typeof ZoneSchema>;

export async function listZones(): Promise<Zone[]> {
  const zones: Zone[] = [];
  let page = 1;
  while (true) {
    const json = await cfFetch(`/zones?page=${page}&per_page=50`);
    const parsed = z.array(ZoneSchema).parse(json.result);
    zones.push(...parsed);
    const info = json.result_info;
    if (!info || page >= info.total_pages) break;
    page++;
  }
  return zones;
}

// --- DNS Records ---

const DnsRecordSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  content: z.string(),
  proxied: z.boolean().catch(false),
  ttl: z.number().catch(1),
  priority: z.number().optional(),
});

export type DnsRecord = z.infer<typeof DnsRecordSchema>;

export async function listDnsRecords(zoneId: string): Promise<DnsRecord[]> {
  const records: DnsRecord[] = [];
  let page = 1;
  while (true) {
    const json = await cfFetch(`/zones/${zoneId}/dns_records?page=${page}&per_page=100`);
    const parsed = z.array(DnsRecordSchema).parse(json.result);
    records.push(...parsed);
    const info = json.result_info;
    if (!info || page >= info.total_pages) break;
    page++;
  }
  return records;
}

export async function getDnsRecord(zoneId: string, recordId: string): Promise<DnsRecord> {
  const json = await cfFetch(`/zones/${zoneId}/dns_records/${recordId}`);
  return DnsRecordSchema.parse(json.result);
}

export type DnsRecordInput = {
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
  priority?: number;
};

export async function createDnsRecord(zoneId: string, input: DnsRecordInput): Promise<DnsRecord> {
  const json = await cfFetch(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return DnsRecordSchema.parse(json.result);
}

export async function updateDnsRecord(
  zoneId: string,
  recordId: string,
  input: DnsRecordInput,
): Promise<DnsRecord> {
  const json = await cfFetch(`/zones/${zoneId}/dns_records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return DnsRecordSchema.parse(json.result);
}

export async function deleteDnsRecord(zoneId: string, recordId: string): Promise<void> {
  await cfFetch(`/zones/${zoneId}/dns_records/${recordId}`, { method: "DELETE" });
}
