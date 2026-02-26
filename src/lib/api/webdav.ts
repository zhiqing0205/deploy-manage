import { getEnv } from "@/lib/env";

export async function uploadToWebDav(filename: string, body: string): Promise<void> {
  const env = getEnv();
  if (!env.WEBDAV_URL) throw new Error("WEBDAV_URL 未配置。");

  const base = env.WEBDAV_URL.replace(/\/+$/, "");
  const path = env.WEBDAV_PATH ? `/${env.WEBDAV_PATH.replace(/^\/+|\/+$/g, "")}` : "";
  const url = `${base}${path}/${filename}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
  };

  if (env.WEBDAV_USERNAME) {
    const cred = `${env.WEBDAV_USERNAME}:${env.WEBDAV_PASSWORD ?? ""}`;
    headers["Authorization"] = `Basic ${Buffer.from(cred).toString("base64")}`;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body,
  });

  if (!res.ok) {
    throw new Error(`WebDAV upload failed: ${res.status} ${res.statusText}`);
  }
}
