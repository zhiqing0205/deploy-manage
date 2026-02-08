import { unstable_noStore as noStore } from "next/cache";

import { createId, nowIso } from "@/lib/ids";
import { DataFileSchema, type DataFile, type Server, type Service } from "@/lib/model";
import { getDataStore } from "@/lib/storage";

export async function readDataFile(): Promise<{ data: DataFile; etag?: string }> {
  noStore();
  const store = getDataStore();
  const res = await store.read();
  return { data: DataFileSchema.parse(res.data), etag: res.etag };
}

export async function writeDataFile(
  data: DataFile,
  etag?: string,
): Promise<{ etag?: string }> {
  const store = getDataStore();
  return store.write(DataFileSchema.parse(data), { etag });
}

function bySortOrder<T extends { sortOrder?: number; name: string }>(a: T, b: T): number {
  const sa = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const sb = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  return sa - sb || a.name.localeCompare(b.name);
}

export async function listServers(): Promise<Server[]> {
  const { data } = await readDataFile();
  return [...data.servers].sort(bySortOrder);
}

export async function listServices(): Promise<Service[]> {
  const { data } = await readDataFile();
  return [...data.services].sort(bySortOrder);
}

export async function reorderServers(ids: string[]): Promise<void> {
  const { data, etag } = await readDataFile();
  const orderMap = new Map(ids.map((id, idx) => [id, idx]));
  const servers = data.servers.map((s) => ({
    ...s,
    sortOrder: orderMap.get(s.id) ?? s.sortOrder,
  }));
  await writeDataFile({ ...data, servers }, etag);
}

export async function reorderServices(ids: string[]): Promise<void> {
  const { data, etag } = await readDataFile();
  const orderMap = new Map(ids.map((id, idx) => [id, idx]));
  const services = data.services.map((s) => ({
    ...s,
    sortOrder: orderMap.get(s.id) ?? s.sortOrder,
  }));
  await writeDataFile({ ...data, services }, etag);
}

export async function getDomainOrder(): Promise<string[]> {
  const { data } = await readDataFile();
  return data.domainOrder;
}

export async function reorderDomains(ids: string[]): Promise<void> {
  const { data, etag } = await readDataFile();
  await writeDataFile({ ...data, domainOrder: ids }, etag);
}

export async function getServerById(id: string): Promise<Server | undefined> {
  const { data } = await readDataFile();
  return data.servers.find((s) => s.id === id);
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  const { data } = await readDataFile();
  return data.services.find((s) => s.id === id);
}

export async function createServer(
  input: Omit<Server, "id" | "createdAt" | "updatedAt">,
): Promise<Server> {
  const { data, etag } = await readDataFile();
  const server: Server = {
    ...input,
    id: createId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const next: DataFile = {
    ...data,
    servers: [...data.servers, server],
  };
  await writeDataFile(next, etag);
  return server;
}

export async function updateServer(
  id: string,
  patch: Partial<Omit<Server, "id" | "createdAt">>,
): Promise<Server> {
  const { data, etag } = await readDataFile();
  const idx = data.servers.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error("服务器不存在。");
  const current = data.servers[idx];
  const updated: Server = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  };
  const servers = [...data.servers];
  servers[idx] = updated;
  await writeDataFile({ ...data, servers }, etag);
  return updated;
}

export async function deleteServer(id: string): Promise<void> {
  const { data, etag } = await readDataFile();
  const servers = data.servers.filter((s) => s.id !== id);
  const services = data.services.map((svc) =>
    svc.serverId === id ? { ...svc, serverId: undefined, updatedAt: nowIso() } : svc,
  );
  await writeDataFile({ ...data, servers, services }, etag);
}

export async function createService(
  input: Omit<Service, "id" | "createdAt" | "updatedAt">,
): Promise<Service> {
  const { data, etag } = await readDataFile();
  const service: Service = {
    ...input,
    id: createId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await writeDataFile({ ...data, services: [...data.services, service] }, etag);
  return service;
}

export async function updateService(
  id: string,
  patch: Partial<Omit<Service, "id" | "createdAt">>,
): Promise<Service> {
  const { data, etag } = await readDataFile();
  const idx = data.services.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error("应用不存在。");
  const current = data.services[idx];
  const updated: Service = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  };
  const services = [...data.services];
  services[idx] = updated;
  await writeDataFile({ ...data, services }, etag);
  return updated;
}

export async function deleteService(id: string): Promise<void> {
  const { data, etag } = await readDataFile();
  const services = data.services.filter((s) => s.id !== id);
  await writeDataFile({ ...data, services }, etag);
}
