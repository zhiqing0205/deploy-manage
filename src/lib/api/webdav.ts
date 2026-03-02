export type WebDavUploadConfig = {
  url: string;
  username?: string;
  password?: string;
  path?: string;
};

function buildHeaders(config: WebDavUploadConfig): Record<string, string> {
  const headers: Record<string, string> = {};
  if (config.username) {
    const cred = `${config.username}:${config.password ?? ""}`;
    headers["Authorization"] = `Basic ${Buffer.from(cred).toString("base64")}`;
  }
  return headers;
}

function buildBaseUrl(config: WebDavUploadConfig): string {
  const base = config.url.replace(/\/+$/, "");
  const pathSegment = config.path ? `/${config.path.replace(/^\/+|\/+$/g, "")}` : "";
  return `${base}${pathSegment}`;
}

export async function uploadToWebDav(
  filename: string,
  body: string,
  config: WebDavUploadConfig,
): Promise<void> {
  const url = `${buildBaseUrl(config)}/${filename}`;

  const headers = buildHeaders(config);
  headers["Content-Type"] = "application/json; charset=utf-8";

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body,
  });

  if (!res.ok) {
    throw new Error(`WebDAV upload failed: ${res.status} ${res.statusText}`);
  }
}

export async function testWebDavConnection(config: WebDavUploadConfig): Promise<void> {
  const url = buildBaseUrl(config);

  const headers = buildHeaders(config);
  headers["Depth"] = "0";

  const res = await fetch(url, {
    method: "PROPFIND",
    headers,
  });

  if (!res.ok) {
    throw new Error(`WebDAV connection failed: ${res.status} ${res.statusText}`);
  }
}
