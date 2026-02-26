import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const servers = sqliteTable("servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host"),
  provider: text("provider"),
  region: text("region"),
  panelUrl: text("panel_url"),
  tags: text("tags").notNull().default("[]"),
  notes: text("notes").notNull().default(""),

  // Probe (Komari) integration
  probeUuid: text("probe_uuid"),
  cpuName: text("cpu_name"),
  cpuCores: integer("cpu_cores"),
  os: text("os"),
  arch: text("arch"),
  memTotal: integer("mem_total"),
  diskTotal: integer("disk_total"),

  // Billing
  price: real("price"),
  billingCycle: text("billing_cycle"),
  currency: text("currency"),
  expiredAt: text("expired_at"),

  sortOrder: integer("sort_order"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  serverId: text("server_id"),
  proxyServerId: text("proxy_server_id"),
  status: text("status").notNull().default("active"),
  deploymentType: text("deployment_type").notNull().default("other"),
  repoUrl: text("repo_url"),
  github: text("github"),
  urls: text("urls").notNull().default("[]"),
  managementUrls: text("management_urls").notNull().default("[]"),
  healthcheckUrl: text("healthcheck_url"),
  tags: text("tags").notNull().default("[]"),
  notes: text("notes").notNull().default(""),

  // Uptime Kuma integration
  monitorId: integer("monitor_id"),
  monitorGroup: text("monitor_group"),

  // Nested objects as JSON
  proxy: text("proxy"),
  docker: text("docker"),
  vercel: text("vercel"),

  sortOrder: integer("sort_order"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const domains = sqliteTable("domains", {
  id: text("id").primaryKey(),
  zoneId: text("zone_id").notNull().unique(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  sortOrder: integer("sort_order"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
