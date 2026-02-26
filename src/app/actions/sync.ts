"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { listZones } from "@/lib/api/cloudflare";
import { fetchProbeNodes } from "@/lib/api/probe";
import { fetchStatusMonitors } from "@/lib/api/status";
import { getDbWithMigrate } from "@/lib/db";
import { domains, servers, services } from "@/lib/db/schema";
import { createId, nowIso } from "@/lib/ids";

// --- Server (Probe) import ---

export type RemoteServer = {
  uuid: string;
  name: string;
  cpuName: string;
  cpuCores: number;
  os: string;
  arch: string;
  region: string;
  memTotal: number;
  diskTotal: number;
  price: number;
  billingCycle: number;
  currency: string;
  expiredAt: string;
  alreadyImported: boolean;
};

export async function fetchRemoteServersAction(): Promise<
  { data: RemoteServer[] } | { error: string }
> {
  try {
    const nodes = await fetchProbeNodes();
    const db = await getDbWithMigrate();
    const allServers = await db.select({ probeUuid: servers.probeUuid }).from(servers);
    const existingUuids = new Set(allServers.map((s) => s.probeUuid).filter(Boolean));

    const list: RemoteServer[] = nodes.map((n) => ({
      uuid: n.uuid,
      name: n.name,
      cpuName: n.cpu_name,
      cpuCores: n.cpu_cores,
      os: n.os,
      arch: n.arch,
      region: n.region,
      memTotal: n.mem_total,
      diskTotal: n.disk_total,
      price: n.price,
      billingCycle: n.billing_cycle,
      currency: n.currency,
      expiredAt: n.expired_at,
      alreadyImported: existingUuids.has(n.uuid),
    }));

    return { data: list };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "获取远程服务器失败。" };
  }
}

export async function importServersAction(
  uuids: string[],
): Promise<{ count: number } | { error: string }> {
  try {
    const nodes = await fetchProbeNodes();
    const selected = nodes.filter((n) => uuids.includes(n.uuid));
    if (selected.length === 0) return { error: "未选择任何服务器。" };

    const db = await getDbWithMigrate();
    const allServers = await db.select().from(servers);
    const byProbeUuid = new Map(allServers.filter((s) => s.probeUuid).map((s) => [s.probeUuid, s]));
    let count = 0;

    for (const node of selected) {
      const patch = {
        cpuName: node.cpu_name || null,
        cpuCores: node.cpu_cores || null,
        os: node.os || null,
        arch: node.arch || null,
        memTotal: node.mem_total || null,
        diskTotal: node.disk_total || null,
        price: node.price || null,
        billingCycle: node.billing_cycle === -1 ? "永久" : node.billing_cycle > 0 ? `${node.billing_cycle}天` : null,
        currency: node.currency || null,
        expiredAt: node.expired_at || null,
      };

      const existing = byProbeUuid.get(node.uuid);
      if (existing) {
        await db
          .update(servers)
          .set({ ...patch, updatedAt: nowIso() })
          .where(eq(servers.id, existing.id));
      } else {
        const parsedTags = node.tags ? node.tags.split(";").map((t) => t.trim()).filter(Boolean) : [];
        const now = nowIso();
        const newServer = {
          id: createId(),
          name: node.name,
          host: null,
          provider: node.group || null,
          region: node.region || null,
          panelUrl: null,
          tags: JSON.stringify(parsedTags),
          notes: "",
          probeUuid: node.uuid,
          ...patch,
          sortOrder: null,
          createdAt: now,
          updatedAt: now,
        };
        await db.insert(servers).values(newServer);
      }
      count++;
    }

    revalidatePath("/servers");
    revalidatePath("/");
    return { count };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "导入失败。" };
  }
}

// --- Service (Status Monitor) import ---

export type RemoteService = {
  monitorId: number;
  name: string;
  group: string;
  type: string;
  alreadyImported: boolean;
};

export async function fetchRemoteServicesAction(): Promise<
  { data: RemoteService[] } | { error: string }
> {
  try {
    const monitors = await fetchStatusMonitors();
    const db = await getDbWithMigrate();
    const allServices = await db.select({ monitorId: services.monitorId }).from(services);
    const existingIds = new Set(allServices.map((s) => s.monitorId).filter(Boolean));

    const list: RemoteService[] = monitors.map((m) => ({
      monitorId: m.id,
      name: m.name,
      group: m.group,
      type: m.type,
      alreadyImported: existingIds.has(m.id),
    }));

    return { data: list };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "获取远程应用失败。" };
  }
}

export async function importServicesAction(
  monitorIds: number[],
): Promise<{ count: number } | { error: string }> {
  try {
    const monitors = await fetchStatusMonitors();
    const selected = monitors.filter((m) => monitorIds.includes(m.id));
    if (selected.length === 0) return { error: "未选择任何应用。" };

    const db = await getDbWithMigrate();
    const allServices = await db.select({ monitorId: services.monitorId }).from(services);
    const existingIds = new Set(allServices.map((s) => s.monitorId).filter(Boolean));
    let count = 0;

    for (const monitor of selected) {
      if (existingIds.has(monitor.id)) continue;

      const now = nowIso();
      const newService = {
        id: createId(),
        name: monitor.name,
        description: "",
        serverId: null,
        proxyServerId: null,
        status: "active",
        deploymentType: "other",
        repoUrl: null,
        github: null,
        urls: "[]",
        managementUrls: "[]",
        healthcheckUrl: null,
        tags: "[]",
        notes: "",
        monitorId: monitor.id,
        monitorGroup: monitor.group,
        proxy: null,
        docker: null,
        vercel: null,
        sortOrder: null,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(services).values(newService);
      count++;
    }

    if (count === 0) return { error: "所选应用已全部导入。" };

    revalidatePath("/services");
    revalidatePath("/");
    return { count };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "导入失败。" };
  }
}

// --- Domain (Cloudflare zones) import ---

export type RemoteDomain = {
  zoneId: string;
  name: string;
  status: string;
  alreadyImported: boolean;
};

export async function fetchRemoteDomainsAction(): Promise<
  { data: RemoteDomain[] } | { error: string }
> {
  try {
    const zones = await listZones();
    const db = await getDbWithMigrate();
    const allDomains = await db.select({ zoneId: domains.zoneId }).from(domains);
    const existingZoneIds = new Set(allDomains.map((d) => d.zoneId));

    const list: RemoteDomain[] = zones.map((z) => ({
      zoneId: z.id,
      name: z.name,
      status: z.status,
      alreadyImported: existingZoneIds.has(z.id),
    }));

    return { data: list };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "获取远程域名失败。" };
  }
}

export async function importDomainsAction(
  zoneIds: string[],
): Promise<{ count: number } | { error: string }> {
  try {
    const zones = await listZones();
    const selected = zones.filter((z) => zoneIds.includes(z.id));
    if (selected.length === 0) return { error: "未选择任何域名。" };

    const db = await getDbWithMigrate();
    const allDomains = await db.select({ zoneId: domains.zoneId }).from(domains);
    const existingZoneIds = new Set(allDomains.map((d) => d.zoneId));
    let count = 0;

    for (const zone of selected) {
      if (existingZoneIds.has(zone.id)) continue;

      const now = nowIso();
      await db.insert(domains).values({
        id: createId(),
        zoneId: zone.id,
        name: zone.name,
        status: zone.status,
        sortOrder: null,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }

    if (count === 0) return { error: "所选域名已全部导入。" };

    revalidatePath("/domains");
    return { count };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "导入失败。" };
  }
}
