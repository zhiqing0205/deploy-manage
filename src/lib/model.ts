import { z } from "zod";

export const UrlItemSchema = z
  .object({
    label: z.string().trim().min(1).optional(),
    url: z.string().trim().url(),
  })
  .strict();

export type UrlItem = z.infer<typeof UrlItemSchema>;

export const ServerSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    host: z.string().trim().min(1).optional(),
    provider: z.string().trim().min(1).optional(),
    region: z.string().trim().min(1).optional(),
    panelUrl: z.string().trim().url().optional(),
    tags: z.array(z.string().trim().min(1)).catch([]),
    notes: z.string().catch(""),
    createdAt: z.string().datetime().catch(new Date(0).toISOString()),
    updatedAt: z.string().datetime().catch(new Date(0).toISOString()),
  })
  .strict();

export type Server = z.infer<typeof ServerSchema>;

export const DeploymentTypeSchema = z.enum([
  "docker",
  "vercel",
  "reverse_proxy",
  "static",
  "other",
]);

export type DeploymentType = z.infer<typeof DeploymentTypeSchema>;

export const ProxyTypeSchema = z.enum([
  "none",
  "nginx",
  "caddy",
  "traefik",
  "1panel",
  "other",
]);

export type ProxyType = z.infer<typeof ProxyTypeSchema>;

export const ServiceSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    description: z.string().catch(""),
    serverId: z.string().trim().min(1).optional(),
    status: z.enum(["active", "paused", "archived"]).catch("active"),
    deploymentType: DeploymentTypeSchema.catch("other"),
    repoUrl: z.string().trim().url().optional(),
    urls: z.array(UrlItemSchema).catch([]),
    managementUrls: z.array(UrlItemSchema).catch([]),
    healthcheckUrl: z.string().trim().url().optional(),
    tags: z.array(z.string().trim().min(1)).catch([]),
    notes: z.string().catch(""),
    proxy: z
      .object({
        type: ProxyTypeSchema.catch("none"),
        upstream: z.string().trim().optional(),
        rules: z.string().catch(""),
      })
      .optional(),
    docker: z
      .object({
        composePath: z.string().trim().optional(),
        containerName: z.string().trim().optional(),
      })
      .optional(),
    vercel: z
      .object({
        project: z.string().trim().optional(),
      })
      .optional(),
    createdAt: z.string().datetime().catch(new Date(0).toISOString()),
    updatedAt: z.string().datetime().catch(new Date(0).toISOString()),
  })
  .strict();

export type Service = z.infer<typeof ServiceSchema>;

export const DataFileSchema = z
  .object({
    version: z.literal(1).catch(1),
    servers: z.array(ServerSchema).catch([]),
    services: z.array(ServiceSchema).catch([]),
  })
  .strict();

export type DataFile = z.infer<typeof DataFileSchema>;

