import { asc, eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

import { getDb } from "@/lib/db";
import { domainOrder, servers, services } from "@/lib/db/schema";
import { createId, nowIso } from "@/lib/ids";
import type { Server, Service } from "@/lib/model";

// ---------------------------------------------------------------------------
// JSON column helpers
// ---------------------------------------------------------------------------

function parseJson<T>(val: string | null, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function toJson(val: unknown): string {
  return JSON.stringify(val ?? null);
}

// ---------------------------------------------------------------------------
// Row → domain model mappers
// ---------------------------------------------------------------------------

function rowToServer(row: typeof servers.$inferSelect): Server {
  return {
    id: row.id,
    name: row.name,
    host: row.host ?? undefined,
    provider: row.provider ?? undefined,
    region: row.region ?? undefined,
    panelUrl: row.panelUrl ?? undefined,
    tags: parseJson<string[]>(row.tags, []),
    notes: row.notes,
    probeUuid: row.probeUuid ?? undefined,
    cpuName: row.cpuName ?? undefined,
    cpuCores: row.cpuCores ?? undefined,
    os: row.os ?? undefined,
    arch: row.arch ?? undefined,
    memTotal: row.memTotal ?? undefined,
    diskTotal: row.diskTotal ?? undefined,
    price: row.price ?? undefined,
    billingCycle: row.billingCycle ?? undefined,
    currency: row.currency ?? undefined,
    expiredAt: row.expiredAt ?? undefined,
    sortOrder: row.sortOrder ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToService(row: typeof services.$inferSelect): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    serverId: row.serverId ?? undefined,
    proxyServerId: row.proxyServerId ?? undefined,
    status: row.status as Service["status"],
    deploymentType: row.deploymentType as Service["deploymentType"],
    repoUrl: row.repoUrl ?? undefined,
    github: row.github ?? undefined,
    urls: parseJson(row.urls, []),
    managementUrls: parseJson(row.managementUrls, []),
    healthcheckUrl: row.healthcheckUrl ?? undefined,
    tags: parseJson<string[]>(row.tags, []),
    notes: row.notes,
    monitorId: row.monitorId ?? undefined,
    monitorGroup: row.monitorGroup ?? undefined,
    proxy: parseJson(row.proxy, undefined) ?? undefined,
    docker: parseJson(row.docker, undefined) ?? undefined,
    vercel: parseJson(row.vercel, undefined) ?? undefined,
    sortOrder: row.sortOrder ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Domain model → DB row helpers (for insert / update)
// ---------------------------------------------------------------------------

function serverToRow(s: Omit<Server, "id" | "createdAt" | "updatedAt">) {
  return {
    name: s.name,
    host: s.host ?? null,
    provider: s.provider ?? null,
    region: s.region ?? null,
    panelUrl: s.panelUrl ?? null,
    tags: toJson(s.tags ?? []),
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
  };
}

function serviceToRow(s: Omit<Service, "id" | "createdAt" | "updatedAt">) {
  return {
    name: s.name,
    description: s.description ?? "",
    serverId: s.serverId ?? null,
    proxyServerId: s.proxyServerId ?? null,
    status: s.status ?? "active",
    deploymentType: s.deploymentType ?? "other",
    repoUrl: s.repoUrl ?? null,
    github: s.github ?? null,
    urls: toJson(s.urls ?? []),
    managementUrls: toJson(s.managementUrls ?? []),
    healthcheckUrl: s.healthcheckUrl ?? null,
    tags: toJson(s.tags ?? []),
    notes: s.notes ?? "",
    monitorId: s.monitorId ?? null,
    monitorGroup: s.monitorGroup ?? null,
    proxy: s.proxy ? toJson(s.proxy) : null,
    docker: s.docker ? toJson(s.docker) : null,
    vercel: s.vercel ? toJson(s.vercel) : null,
    sortOrder: s.sortOrder ?? null,
  };
}

// ---------------------------------------------------------------------------
// Servers
// ---------------------------------------------------------------------------

export async function listServers(): Promise<Server[]> {
  noStore();
  const db = getDb();
  const rows = await db
    .select()
    .from(servers)
    .orderBy(asc(servers.sortOrder), asc(servers.name));
  return rows.map(rowToServer);
}

export async function getServerById(id: string): Promise<Server | undefined> {
  noStore();
  const db = getDb();
  const rows = await db.select().from(servers).where(eq(servers.id, id));
  return rows[0] ? rowToServer(rows[0]) : undefined;
}

export async function createServer(
  input: Omit<Server, "id" | "createdAt" | "updatedAt">,
): Promise<Server> {
  const db = getDb();
  const now = nowIso();
  const id = createId();
  const row = { id, ...serverToRow(input), createdAt: now, updatedAt: now };
  await db.insert(servers).values(row);
  return rowToServer({ ...row, tags: row.tags, notes: row.notes });
}

export async function updateServer(
  id: string,
  patch: Partial<Omit<Server, "id" | "createdAt">>,
): Promise<Server> {
  const db = getDb();
  const existing = await db.select().from(servers).where(eq(servers.id, id));
  if (!existing[0]) throw new Error("服务器不存在。");

  const merged: Server = { ...rowToServer(existing[0]), ...patch, id: existing[0].id, createdAt: existing[0].createdAt };
  const now = nowIso();
  const vals = { ...serverToRow(merged), updatedAt: now };
  await db.update(servers).set(vals).where(eq(servers.id, id));
  return rowToServer({ ...existing[0], ...vals, id, createdAt: existing[0].createdAt });
}

export async function deleteServer(id: string): Promise<void> {
  const db = getDb();
  await db.delete(servers).where(eq(servers.id, id));
  // Nullify serverId / proxyServerId references on services
  const now = nowIso();
  const allSvcs = await db.select().from(services);
  for (const svc of allSvcs) {
    if (svc.serverId === id || svc.proxyServerId === id) {
      await db
        .update(services)
        .set({
          serverId: svc.serverId === id ? null : svc.serverId,
          proxyServerId: svc.proxyServerId === id ? null : svc.proxyServerId,
          updatedAt: now,
        })
        .where(eq(services.id, svc.id));
    }
  }
}

export async function reorderServers(ids: string[]): Promise<void> {
  const db = getDb();
  for (let i = 0; i < ids.length; i++) {
    await db.update(servers).set({ sortOrder: i }).where(eq(servers.id, ids[i]));
  }
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function listServices(): Promise<Service[]> {
  noStore();
  const db = getDb();
  const rows = await db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.name));
  return rows.map(rowToService);
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  noStore();
  const db = getDb();
  const rows = await db.select().from(services).where(eq(services.id, id));
  return rows[0] ? rowToService(rows[0]) : undefined;
}

export async function createService(
  input: Omit<Service, "id" | "createdAt" | "updatedAt">,
): Promise<Service> {
  const db = getDb();
  const now = nowIso();
  const id = createId();
  const row = { id, ...serviceToRow(input), createdAt: now, updatedAt: now };
  await db.insert(services).values(row);
  return rowToService({ ...row });
}

export async function updateService(
  id: string,
  patch: Partial<Omit<Service, "id" | "createdAt">>,
): Promise<Service> {
  const db = getDb();
  const existing = await db.select().from(services).where(eq(services.id, id));
  if (!existing[0]) throw new Error("应用不存在。");

  const merged: Service = { ...rowToService(existing[0]), ...patch, id: existing[0].id, createdAt: existing[0].createdAt };
  const now = nowIso();
  const vals = { ...serviceToRow(merged), updatedAt: now };
  await db.update(services).set(vals).where(eq(services.id, id));
  return rowToService({ ...existing[0], ...vals, id, createdAt: existing[0].createdAt });
}

export async function deleteService(id: string): Promise<void> {
  const db = getDb();
  await db.delete(services).where(eq(services.id, id));
}

export async function reorderServices(ids: string[]): Promise<void> {
  const db = getDb();
  for (let i = 0; i < ids.length; i++) {
    await db.update(services).set({ sortOrder: i }).where(eq(services.id, ids[i]));
  }
}

// ---------------------------------------------------------------------------
// Domain ordering
// ---------------------------------------------------------------------------

export async function getDomainOrder(): Promise<string[]> {
  noStore();
  const db = getDb();
  const rows = await db
    .select()
    .from(domainOrder)
    .orderBy(asc(domainOrder.position));
  return rows.map((r) => r.zoneId);
}

export async function reorderDomains(ids: string[]): Promise<void> {
  const db = getDb();
  await db.delete(domainOrder);
  if (ids.length > 0) {
    await db.insert(domainOrder).values(
      ids.map((zoneId, i) => ({ position: i, zoneId })),
    );
  }
}
