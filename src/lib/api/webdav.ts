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

/**
 * List files in the WebDAV directory matching the given prefix.
 * Uses PROPFIND with Depth:1 to list directory contents, then parses
 * href entries from the XML response.
 */
export async function listWebDavFiles(
  config: WebDavUploadConfig,
  prefix?: string,
): Promise<string[]> {
  const baseUrl = buildBaseUrl(config);

  const headers = buildHeaders(config);
  headers["Depth"] = "1";

  const res = await fetch(baseUrl, {
    method: "PROPFIND",
    headers,
  });

  if (!res.ok) {
    throw new Error(`WebDAV PROPFIND failed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  // Extract href values from the XML response
  const hrefRegex = /<d:href>([^<]+)<\/d:href>|<D:href>([^<]+)<\/D:href>|<href>([^<]+)<\/href>/gi;
  const files: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = hrefRegex.exec(xml)) !== null) {
    const href = match[1] || match[2] || match[3];
    // Decode and extract filename from the href path
    const decoded = decodeURIComponent(href);
    const filename = decoded.split("/").filter(Boolean).pop();
    if (filename && !filename.endsWith("/")) {
      if (!prefix || filename.startsWith(prefix)) {
        files.push(filename);
      }
    }
  }

  return files;
}

/**
 * Delete a file from the WebDAV directory.
 */
export async function deleteWebDavFile(
  filename: string,
  config: WebDavUploadConfig,
): Promise<void> {
  const url = `${buildBaseUrl(config)}/${filename}`;
  const headers = buildHeaders(config);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    throw new Error(`WebDAV delete failed: ${res.status} ${res.statusText}`);
  }
}

/**
 * Cleanup old backup files, keeping only the most recent `retention` files.
 */
export async function cleanupOldBackups(
  config: WebDavUploadConfig,
  retention: number,
): Promise<number> {
  const files = await listWebDavFiles(config, "deploy-manage-");
  // Sort alphabetically (filenames contain ISO timestamps, so this is chronological)
  files.sort();

  const toDelete = files.length > retention ? files.slice(0, files.length - retention) : [];

  for (const file of toDelete) {
    await deleteWebDavFile(file, config);
  }

  return toDelete.length;
}
