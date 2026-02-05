import { z } from "zod";

const DataBackendSchema = z.enum(["local", "webdav", "oss"]);

export type DataBackend = z.infer<typeof DataBackendSchema>;

const EnvSchema = z.object({
  DATA_BACKEND: DataBackendSchema.catch("local"),

  // local
  DATA_PATH: z.string().trim().min(1).catch("./data.json"),

  // webdav
  WEBDAV_URL: z.string().trim().url().optional(),
  WEBDAV_USERNAME: z.string().trim().optional(),
  WEBDAV_PASSWORD: z.string().trim().optional(),
  WEBDAV_FILE_PATH: z.string().trim().min(1).catch("/deploy-manage/data.json"),

  // aliyun oss
  OSS_REGION: z.string().trim().min(1).optional(),
  OSS_ENDPOINT: z.string().trim().min(1).optional(),
  OSS_ACCESS_KEY_ID: z.string().trim().min(1).optional(),
  OSS_ACCESS_KEY_SECRET: z.string().trim().min(1).optional(),
  OSS_BUCKET: z.string().trim().min(1).optional(),
  OSS_OBJECT_KEY: z.string().trim().min(1).catch("deploy-manage/data.json"),
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
