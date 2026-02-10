"use server";

import { asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/action-state";
import { getDb } from "@/lib/db";
import { domainOrder, servers, services } from "@/lib/db/schema";
import { DataFileSchema } from "@/lib/model";

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function importDataAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "请选择要导入的 JSON 文件。" };

  const text = await file.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { error: "JSON 解析失败，请检查文件格式。" };
  }

  const parsed = DataFileSchema.safeParse(json);
  if (!parsed.success) return { error: "数据结构不符合要求，无法导入。" };

  try {
    const db = getDb();
    const data = parsed.data;

    // Clear all tables
    await db.delete(domainOrder);
    await db.delete(services);
    await db.delete(servers);

    // Insert servers
    for (const s of data.servers) {
      await db.insert(servers).values({
        id: s.id,
        name: s.name,
        host: s.host ?? null,
        provider: s.provider ?? null,
        region: s.region ?? null,
        panelUrl: s.panelUrl ?? null,
        tags: JSON.stringify(s.tags ?? []),
        notes: s.notes ?? "",
        probeUuid: s.probeUuid ?? null,
        cpuName: s.cpuName ?? null,
        cpuCores: s.cpuCores ?? null,
        os: s.os ?? null,
        arch: s.arch ?? null,
        memTotal: s.memTotal ?? null,
        diskTotal: s.diskTotal ?? null,
        price: s.price ?? null,
        billingCycle: s.billingCycle ?? null,
        currency: s.currency ?? null,
        expiredAt: s.expiredAt ?? null,
        sortOrder: s.sortOrder ?? null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      });
    }

    // Insert services
    for (const s of data.services) {
      await db.insert(services).values({
        id: s.id,
        name: s.name,
        description: s.description ?? "",
        serverId: s.serverId ?? null,
        proxyServerId: s.proxyServerId ?? null,
        status: s.status ?? "active",
        deploymentType: s.deploymentType ?? "other",
        repoUrl: s.repoUrl ?? null,
        github: s.github ?? null,
        urls: JSON.stringify(s.urls ?? []),
        managementUrls: JSON.stringify(s.managementUrls ?? []),
        healthcheckUrl: s.healthcheckUrl ?? null,
        tags: JSON.stringify(s.tags ?? []),
        notes: s.notes ?? "",
        monitorId: s.monitorId ?? null,
        monitorGroup: s.monitorGroup ?? null,
        proxy: s.proxy ? JSON.stringify(s.proxy) : null,
        docker: s.docker ? JSON.stringify(s.docker) : null,
        vercel: s.vercel ? JSON.stringify(s.vercel) : null,
        sortOrder: s.sortOrder ?? null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      });
    }

    // Insert domain order
    if (data.domainOrder.length > 0) {
      await db.insert(domainOrder).values(
        data.domainOrder.map((zoneId, i) => ({ position: i, zoneId })),
      );
    }

    revalidatePath("/");
    revalidatePath("/servers");
    revalidatePath("/services");
    revalidatePath("/settings");
    redirect("/settings?import=ok");
  } catch (err: unknown) {
    return { error: `导入失败：${asErrorMessage(err)}` };
  }
}

export async function exportDataAction(): Promise<string> {
  const db = getDb();

  const serverRows = await db.select().from(servers).orderBy(asc(servers.sortOrder), asc(servers.name));
  const serviceRows = await db.select().from(services).orderBy(asc(services.sortOrder), asc(services.name));
  const domainRows = await db.select().from(domainOrder).orderBy(asc(domainOrder.position));

  function parseJson<T>(val: string | null, fallback: T): T {
    if (!val) return fallback;
    try { return JSON.parse(val) as T; } catch { return fallback; }
  }

  const data = {
    version: 2 as const,
    servers: serverRows.map((r) => ({
      id: r.id,
      name: r.name,
      host: r.host ?? undefined,
      provider: r.provider ?? undefined,
      region: r.region ?? undefined,
      panelUrl: r.panelUrl ?? undefined,
      tags: parseJson<string[]>(r.tags, []),
      notes: r.notes,
      probeUuid: r.probeUuid ?? undefined,
      cpuName: r.cpuName ?? undefined,
      cpuCores: r.cpuCores ?? undefined,
      os: r.os ?? undefined,
      arch: r.arch ?? undefined,
      memTotal: r.memTotal ?? undefined,
      diskTotal: r.diskTotal ?? undefined,
      price: r.price ?? undefined,
      billingCycle: r.billingCycle ?? undefined,
      currency: r.currency ?? undefined,
      expiredAt: r.expiredAt ?? undefined,
      sortOrder: r.sortOrder ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    services: serviceRows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      serverId: r.serverId ?? undefined,
      proxyServerId: r.proxyServerId ?? undefined,
      status: r.status as "active" | "paused" | "archived",
      deploymentType: r.deploymentType,
      repoUrl: r.repoUrl ?? undefined,
      github: r.github ?? undefined,
      urls: parseJson(r.urls, []),
      managementUrls: parseJson(r.managementUrls, []),
      healthcheckUrl: r.healthcheckUrl ?? undefined,
      tags: parseJson<string[]>(r.tags, []),
      notes: r.notes,
      monitorId: r.monitorId ?? undefined,
      monitorGroup: r.monitorGroup ?? undefined,
      proxy: parseJson(r.proxy, undefined) ?? undefined,
      docker: parseJson(r.docker, undefined) ?? undefined,
      vercel: parseJson(r.vercel, undefined) ?? undefined,
      sortOrder: r.sortOrder ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    domainOrder: domainRows.map((r) => r.zoneId),
  };

  return JSON.stringify(data, null, 2) + "\n";
}
