"use server";

import { revalidatePath } from "next/cache";

import { fetchProbeNodes } from "@/lib/api/probe";
import { fetchStatusMonitors } from "@/lib/api/status";
import { readDataFile, writeDataFile } from "@/lib/data";
import { createId, nowIso } from "@/lib/ids";
import type { Server, Service } from "@/lib/model";

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
    const { data } = await readDataFile();
    const existingUuids = new Set(data.servers.map((s) => s.probeUuid).filter(Boolean));

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

    const { data, etag } = await readDataFile();
    const servers = [...data.servers];
    let count = 0;

    for (const node of selected) {
      const existingIdx = servers.findIndex((s) => s.probeUuid === node.uuid);
      const patch = {
        cpuName: node.cpu_name || undefined,
        cpuCores: node.cpu_cores || undefined,
        os: node.os || undefined,
        arch: node.arch || undefined,
        memTotal: node.mem_total || undefined,
        diskTotal: node.disk_total || undefined,
        price: node.price || undefined,
        billingCycle: node.billing_cycle === -1 ? "永久" : node.billing_cycle > 0 ? `${node.billing_cycle}天` : undefined,
        currency: node.currency || undefined,
        expiredAt: node.expired_at || undefined,
      };

      if (existingIdx >= 0) {
        servers[existingIdx] = {
          ...servers[existingIdx],
          ...patch,
          updatedAt: nowIso(),
        };
      } else {
        const parsedTags = node.tags ? node.tags.split(";").map((t) => t.trim()).filter(Boolean) : [];
        const newServer: Server = {
          id: createId(),
          name: node.name,
          host: undefined,
          provider: node.group || undefined,
          region: node.region || undefined,
          panelUrl: undefined,
          tags: parsedTags,
          notes: "",
          probeUuid: node.uuid,
          ...patch,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        servers.push(newServer);
      }
      count++;
    }

    await writeDataFile({ ...data, servers }, etag);
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
    const { data } = await readDataFile();
    const existingIds = new Set(data.services.map((s) => s.monitorId).filter(Boolean));

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

    const { data, etag } = await readDataFile();
    const services = [...data.services];
    const existingIds = new Set(services.map((s) => s.monitorId).filter(Boolean));
    let count = 0;

    for (const monitor of selected) {
      if (existingIds.has(monitor.id)) continue;

      const newService: Service = {
        id: createId(),
        name: monitor.name,
        description: "",
        status: "active",
        deploymentType: "other",
        urls: [],
        managementUrls: [],
        tags: [],
        notes: "",
        monitorId: monitor.id,
        monitorGroup: monitor.group,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      services.push(newService);
      count++;
    }

    if (count === 0) return { error: "所选应用已全部导入。" };

    await writeDataFile({ ...data, services }, etag);
    revalidatePath("/services");
    revalidatePath("/");
    return { count };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "导入失败。" };
  }
}
