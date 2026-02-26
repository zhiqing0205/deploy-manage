import { z } from "zod";

const EnvSchema = z.object({
  // Turso
  TURSO_DATABASE_URL: z.string().trim().min(1),
  TURSO_AUTH_TOKEN: z.string().trim().min(1).optional(),

  // External services
  PROBE_API_URL: z.string().trim().url().optional(),
  UPTIME_URL: z.string().trim().url().optional(),
  UPTIME_PAGE: z.string().trim().min(1).optional(),
  CLOUDFLARE_API_TOKEN: z.string().trim().min(1).optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function getEnv(): AppEnv {
  return EnvSchema.parse(process.env);
}

export function hasAuthEnabled(): boolean {
  const user = process.env.BASIC_AUTH_USER?.trim();
  const pass = process.env.BASIC_AUTH_PASSWORD?.trim();
  return Boolean(user && pass);
}
