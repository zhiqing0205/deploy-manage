import { getEnv } from "@/lib/env";
import { LocalJsonStore } from "@/lib/storage/local";
import { OssJsonStore } from "@/lib/storage/oss";
import type { DataStore } from "@/lib/storage/types";
import { WebDavJsonStore } from "@/lib/storage/webdav";

let store: DataStore | undefined;

export function getDataStore(): DataStore {
  if (store) return store;

  const env = getEnv();
  if (env.DATA_BACKEND === "local") {
    store = new LocalJsonStore(env.DATA_PATH);
    return store;
  }

  if (env.DATA_BACKEND === "webdav") {
    if (!env.WEBDAV_URL) {
      throw new Error("缺少 WEBDAV_URL 环境变量（DATA_BACKEND=webdav）。");
    }
    store = new WebDavJsonStore(
      env.WEBDAV_URL,
      env.WEBDAV_USERNAME,
      env.WEBDAV_PASSWORD,
      env.WEBDAV_FILE_PATH,
    );
    return store;
  }

  if (env.DATA_BACKEND === "oss") {
    if (
      !env.OSS_REGION ||
      !env.OSS_ACCESS_KEY_ID ||
      !env.OSS_ACCESS_KEY_SECRET ||
      !env.OSS_BUCKET
    ) {
      throw new Error(
        "缺少 OSS 环境变量（DATA_BACKEND=oss）。需要 OSS_REGION/OSS_ACCESS_KEY_ID/OSS_ACCESS_KEY_SECRET/OSS_BUCKET。",
      );
    }
    store = new OssJsonStore(
      {
        region: env.OSS_REGION,
        endpoint: env.OSS_ENDPOINT,
        accessKeyId: env.OSS_ACCESS_KEY_ID,
        accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
        bucket: env.OSS_BUCKET,
      },
      env.OSS_OBJECT_KEY,
    );
    return store;
  }

  // Zod already guards this; fallback anyway.
  store = new LocalJsonStore(env.DATA_PATH);
  return store;
}

